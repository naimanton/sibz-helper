class FormatProduct {
  constructor() {
    blockList.insertAdjacentHTML(
      "beforebegin",
      "<input id=\"formatProductInput\" type=\"submit\" value=\"Получить форматный продукт\">"
    )
    formatProductInput.addEventListener("click", () => {
      blockList.insertAdjacentHTML(
        "beforebegin", 
        "<textarea>" + blockList.querySelector("table").innerText + "</textarea>"
      );
    });

  }

}

class Autoorder {
  constructor() {
    const settings = {
      code_column: 0,
      amount_column: 2,
    };
    Object.assign(this, settings);

    document.querySelector("#blockFilter").insertAdjacentHTML(
        "beforeend",
        `<textarea id="textarea_autoorder" placeholder="Вставить таблицу с заказом"></textarea>`
    )
    this.textarea_autoorder = document.querySelector("#textarea_autoorder");
    this.textarea_autoorder.addEventListener(
      "change",
      () => this.xlsToOrder.call(this, this.textarea_autoorder.value)
    );

  }
  xlsToOrder(xls) {
    if(!xls) return;
    const order = {};
    for (let line of xls.split("\n")) {
      let splitted = line.split("\t");

      if ( ["Код", "Итог:"].includes(splitted[0]) ) continue; 

      order[splitted[this.code_column]] = splitted[this.amount_column];
    }

    const trs = document.querySelectorAll("#blockList tr")
    for (let tr of trs) {
      let code = tr.children[2]?.innerText;
      if (order[code]) {
        for (let i = 0; i < +order[code]; i++) {
          let btn_more = tr.querySelectorAll("button")[1];
          btn_more.dispatchEvent(
            new Event("click", { bubbles: true })
          )
        }
      }
    }
    alert("Заказ сформирован");
  }
}

class AutofactureBuilder {
  constructor() {
    this.canceled = false;
    this.skipped = [];
    const nodes = {
      productTabs: document.querySelector("#productTabs"),
      codeInput: document.querySelector("#code"),
      nameInput: document.querySelector("#name"),
      productSearch: document.querySelector("#productSearch"),
      prodList: document.querySelector("#prodList"),
    };
    const settings = {
      interval_time_ms: 1000,
      code_column: 0,
      amount_column: 2,
    };

    this.query_config = {
      "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "ml-contract": document.querySelector("#intranet a").innerText,
          "sec-ch-ua": "\"Chromium\";v=\"92\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"92\"",
          "sec-ch-ua-mobile": "?0",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer": location.href,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }
    Object.assign(this, nodes, settings);
  }
  _manageOrderTextareaCreating() {
    this.productTabs.insertAdjacentHTML(
      "beforeend",
      `<textarea placeholder="Вставьте заказ" style="margin-left: 90px;" rows="5" cols="30" id="textareaOrder"></textarea>`
    );
    this.textareaOrder = document.querySelector("#textareaOrder");
    this.textareaOrder.addEventListener(
      "change",
      (e) => {
        this._handleOrderTextareaEvent.call(this)
      }
    );
  }
}

class Autofacture extends AutofactureBuilder {
  constructor() {
    super();
    this._manageOrderTextareaCreating.call(this);
  }
  async _handleOrderTextareaEvent() {
    this.query_order = {
      positions: [],
      factura_id: document.querySelectorAll(
        "#delBox div table tbody tr td"
      )[0].innerText,
    };
    this.textareaOrder.disabled = true;
    this._prepareOrderObject.call(this);

    async function* generator() {
      for (let index = 0; index < this.order.length; index++) {
        await this._handleOrderLine.call(this, this.order[index]);
        this.textareaOrder.value = "Прогресс: " + (index+1) + "/" + this.order.length;
        if (this.canceled) return;
        yield index;
      }
    }

    for await (let value of generator.call(this)) {}

    this._turnQueryOrderToQueryConfig.call(this);

    let promise = await fetch("/ru/store/header/new/addproducts/", this.query_config);
    let promise_text = await promise.text();

    alert("Готово. Большинство пропущенных позиций указано в поле для таблицы");

    this.textareaOrder.value = this._skippedToTextarea.call(this);
  }
  _skippedToTextarea() {
    let string = "Пропущенные позиции: ";
    for (let line = 0; line < this.skipped.length; line++) {
      string += line + ", ";
    }
    return string;
  }
  _turnQueryOrderToQueryConfig() {
    let body = "factura_id=" + this.query_order.factura_id;
    for (let line of this.query_order.positions) {
      body += "&" + line.name + "=" + line.amount;
    }
    this.query_config["body"] = body;
  }
  _prepareOrderObject() {
    this.order = [];
    for ( let raw_line of this.textareaOrder.value.split("\n") ) {
      let line = raw_line.split("\t");
      if (line[0] === "Код") continue;
      this.order.push(line);
    }
  }
  async _handleOrderLine(line) {
    this.codeInput.value = line[this.code_column];
    if (this.prodList.style.display !== "none") {
      this.prodList.style.display = "none";
    }
    this.productSearch.dispatchEvent(new Event("click"))

    await new Promise( (resolve) => {
      let interval = setInterval(() => {
        if (this.prodList.style.display !== "none") {
          clearInterval(interval)
          resolve()
        }
      }, this.interval_time_ms)
    });
    this._handleProductAddingToQueryOrder.call(this, line);

  }
  _handleProductAddingToQueryOrder(line) {
    let amount_inputs = document.querySelectorAll("#productForm table input");
    let remain_td = document.querySelectorAll("#productForm tbody tr td");
    if (amount_inputs.length > 1 || 
      !document.querySelector("#prodList form") ||
      +remain_td[3].innerText < line[this.amount_column]) {
        this.skipped.push(line);
        return;
    }
    this.query_order.positions.push({
      name: document.querySelectorAll("#productForm table input")[0].name,
      amount: line[this.amount_column],
    });
  }
}

class ScriptChooser {
  constructor() {
    this.pathnames = {
      autoorder: "/ru/store/header/order/showcase/new/",
      autofacture: "/ru/store/header/new/edit/",
      formatproduct: "/ru/store/header/order/showcase/new/",
    };
    this.choice = {};
    this.choose.call(this, document.location.pathname);
  }
  choose(pathname) {
    if (pathname === this.pathnames.autoorder) {
     this.choice.autoorder = new Autoorder;
    }
    if (pathname === this.pathnames.autofacture) {
      this.choice.autofacture = new Autofacture;
    }
    if (pathname === this.pathnames.formatproduct) {
      this.choice.formatproduct = new FormatProduct;
    }
  }
}

new ScriptChooser;

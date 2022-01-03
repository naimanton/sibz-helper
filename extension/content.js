const sheConfig = {
  textareaCols: 'cols="25" ',
  style: 'style="border: orange 2px solid; '+ 
    'padding: 5px; '+ 
    'background-color: lightyellow" ', // end-space required
}
const sheValid = {
  isNotNull(expression, description) {
    if (expression === null) {
      throw new Error(
        "sheValidError: Expected " + description + " is not null, but it is."
      );
    }
    return expression;
  },
  isNotUndefined(expression, description) {
    if (expression === undefined) {
      throw new Error(
        "sheValidError: Expected " + description + " is not undefined, but it is."
      );
    }
    return expression;
  },
};
const sheContent = {
  init() {
    this.pathnames = {
      index: "/ru/",
      order: "/ru/store/header/order/showcase/new/",
      facture: "/ru/store/header/new/edit/",
    };
    this.choice = {};
    this.chooseScript.call(this, document.location.pathname);
    return this;
  },
  chooseScript(pathname) {
    if (pathname === this.pathnames.order) {
      this.choice.autoOrder = this.scripts.autoOrder.init();
      this.choice.formatProduct = this.scripts.formatProduct.init();
      this.choice.orderBackup = this.scripts.orderBackup.init();
      this.choice.orderCleaning = this.scripts.orderCleaning.init();
    }
    else if (pathname === this.pathnames.facture) {
      this.choice.autofacture = this.scripts.autoFacture.init();
    }
    else if (pathname === this.pathnames.index) {
      this.choice.autofacture = this.scripts.autoCart.init();
    }
  },
  scripts: {
    formatProduct: {
      init() {
        const blockList = document.querySelector("#blockList");

        sheValid.isNotNull(blockList, 'document.querySelector("#blockList")');

        blockList.insertAdjacentHTML(
          "beforebegin",
          '<input ' +
            sheConfig.style +
            'id="formatProductInput" ' +
            'type="submit" ' + 
            'value="Получить форматный продукт" ' +
          '>'
        );

        const formatProductInput = document.querySelector("#formatProductInput");

        formatProductInput.addEventListener("click", () => {
          const table = blockList.querySelector("table");

          sheValid.isNotNull(table, 'blockList.querySelector("table")');

          blockList.insertAdjacentHTML(
            "beforebegin", 
            "<textarea " + sheConfig.style + ">" + table.innerText + "</textarea>"
          );
        });
        return this;
      }
    },
    orderBackup: {
      init() {
        this.sale = 0.9;
        
        const blockFilter = document.querySelector("#blockFilter");
        
        sheValid.isNotNull(blockFilter, 'document.querySelector("#blockFilter")');

        blockFilter.insertAdjacentHTML(
            "beforeend",
            '<textarea ' +
              sheConfig.textareaCols +
              sheConfig.style +
              'id="textareaOrderBackup" ' +
              'placeholder="Ctrl+Delete для копирования внесенного заказа">'+
            '</textarea>'
        );

        this.textareaOrderBackup = document.querySelector("#textareaOrderBackup");
        this.textareaOrderBackup.addEventListener(
          "keydown",
          (e) => {
            if (e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              this.backupOrder.call(this);
            }
          }
        );
        return this; 
      },
      backupOrder() {
        const trs = sheValid.isNotNull(
          document.querySelectorAll(".product-row:not(.absent)"),
          'document.querySelectorAll(".product-row:not(.absent)")'
        );
        let result = "";
        for (let tr of trs) {
          let value = tr.querySelector(".order_count").value; 
          if (value === '' || value === '0') continue;
          result += tr.children[2].innerText + "\t" +
            tr.children[3].innerText + "\t" + 
            value + "\t" + 
            tr.children[6].innerText + "\t" +
            +(tr.children[7].innerText)*this.sale + "\n";
        }      
        this.textareaOrderBackup.value = result;
      }
    },
    orderCleaning: {
      init() {
        const blockList = document.querySelector("#blockList");

        sheValid.isNotNull(blockList, 'document.querySelector("#blockList")');

        blockList.insertAdjacentHTML(
          "beforebegin",
          '<input ' +
            sheConfig.style +
            'id="cleanOrderInput" ' +
            'type="submit" ' + 
            'value="Очистить заказ" ' +
          '>'
        );

        const cleanOrderInput = document.querySelector("#cleanOrderInput");

        cleanOrderInput.addEventListener(
          "click",
          () => {
            let isOkToClean = confirm(
              "Все введеные количества будут очищены. Продолжить?"
            );
            
            if (!isOkToClean) {
              alert("Очистка отменена.");
              return;
            };

            this.cleanOrder.call(this);
          }
        );
      },
      cleanOrder() {
        const trs = sheValid.isNotNull(
          document.querySelectorAll(".product-row:not(.absent)"),
          'document.querySelectorAll(".product-row:not(.absent)")'
        );
        for (let tr of trs) {
          const inputs = sheValid.isNotUndefined(
            tr?.children[13]?.children?.[0]?.children, 
            'tr?.children[13]?.children?.[0]?.children'
          );

          for (;inputs[1].value !== '';) {
            inputs[0].dispatchEvent(
              new Event("click", { bubbles: true })
            );
          }

        }
        alert("Заказ очищен.");
      }
    },
    autoOrder: {
      init() {
        const settings = {
          code_column: 0,
          amount_column: 2,
        };
        Object.assign(this, settings);

        const blockFilter = document.querySelector("#blockFilter");
        
        sheValid.isNotNull(blockFilter, 'document.querySelector("#blockFilter")');

        blockFilter.insertAdjacentHTML(
            "beforeend",
            '<textarea ' +
            sheConfig.style +
            sheConfig.textareaCols +
            'id="textareaAutoOrder" ' +
            'placeholder="Вставьте таблицу с заказом и нажмите Ctrl+Delete">' +
            '</textarea>'
        )
        const textareaAutoOrder = document.querySelector("#textareaAutoOrder");
        textareaAutoOrder.addEventListener(
          "keydown",
          (e) => {
            if (e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              this.shOutputToOrder.call(
                this, 
                textareaAutoOrder.value,
                blockList
              )
            }
          }
        );
        return this;
      },
      shOutputToOrder(shOutput, blockList) {
        if(!shOutput) return;
        const order = {};
        for (let line of shOutput.split("\n")) {
          let splitted = line.split("\t");

          if ( ["Код", "Итог:"].includes(splitted[0]) ) continue; 

          order[splitted[this.code_column]] = splitted[this.amount_column];
        }

        const trs = blockList.querySelectorAll("tr");

        sheValid.isNotNull(trs, 'blockList.querySelectorAll("tr")');

        for (let tr of trs) {
          let code = tr.children[2]?.innerText;
          if (order[code]) {
            for (let i = 0; i < +order[code]; i++) {
              let btn_more = tr.querySelectorAll("button")[1];
              
              sheValid.isNotNull(btn_more, 'tr.querySelectorAll("button")[1]');

              btn_more.dispatchEvent(
                new Event("click", { bubbles: true })
              )
            }
          }
        }
        alert("Заказ сформирован");
      }
    },
    autoCart: {
      init() {
        this.autoCartArea = document.createElement("textarea");
        this.autoCartArea.placeholder = "Вставьте заказ и нажмите Ctrl+Delete";
        const navbarTopMenu = document.querySelector(".navbar-top__menu._geo");
        
        sheValid.isNotNull(
          navbarTopMenu, 
          'document.querySelector(".navbar-top__menu._geo")'
        );

        navbarTopMenu.insertAdjacentElement(
          "afterend",
          this.autoCartArea
        )
        this.autoCartArea.addEventListener("keydown", e => {
            if(e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
                this.run(window["userId"], this.autoCartArea.value)
            }
        })
      },
      shOutputToOrder(shOutput) {
        if (!shOutput) return;

        const order = {};

        for (let line of shOutput.split("\n")) {
            let splitted = line.split("\t");
            if (["Код", "Итог:"].includes(splitted[0])) continue;
            order[splitted[0]] = [splitted[1], splitted[2]];
        }
        return order;
      },
      run(contract, shOutput) {
        const order = this.shOutputToOrder(shOutput);
        this.autoCartArea.value = "";
        const orderKeys = Object.keys(order);
        for (let k in order) {
            this.add(
              contract, 
              +k, 
              order[k], 
              k === orderKeys[orderKeys.length-1]
            );
        }
      },
      async add(contract, article, [name, amount], isLast) {
        const fetchResult = await fetch("https://kz.siberianhealth.com/ru/shop/ajax/cart/item/add/", {
          "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
          },
          "referrer": "https://kz.siberianhealth.com/ru/",
          "referrerPolicy": "strict-origin-when-cross-origin",

          "body": '{"productArticle":' + 
            article + ',"optionArticle":' + 
            article + ',"amount":' + amount + 
            ',"packageContract":' + contract + '}',
          
          "method": "POST",
          "mode": "cors",
          "credentials": "include"
        })

        const textResult = await fetchResult.text();
        const objectResult = JSON.parse(textResult);
        if (objectResult.success === false) {
          this.autoCartArea.value += ("Не удалось добавить " + `"${name}"\n`)
        }
        if (isLast) {
          const isCartRedirecting = confirm("Готово. Перейти в корзину?");
          if(!isCartRedirecting) return;
          location.pathname = "/ru/shop/cart/";
        }
      },
    },
    autoFacture: {
      init() {
        this.prepare.call(this);
        this._manageOrderTextareaCreating.call(this);
        return this;
      },
      prepare() {
        this.skipped = [];
        let d = document;
        const nodes = {
          productTabs: sheValid.isNotNull(
            d.querySelector("#productTabs"), 
            'd.querySelector("#productTabs")'
          ),
          codeInput: sheValid.isNotNull(
            d.querySelector("#code"), 
            'd.querySelector("#code")'
          ),
          nameInput: sheValid.isNotNull(
            d.querySelector("#name"), 
            'd.querySelector("#name")'
          ),
          productSearch: sheValid.isNotNull(
            d.querySelector("#productSearch"),
            'd.querySelector("#productSearch")'
          ),
          prodList: sheValid.isNotNull(
            d.querySelector("#prodList"), 
            'd.querySelector("#prodList")'
          ),
        };

        const settings = {
          interval_time_ms: 1000,
          code_column: 0,
          amount_column: 2,
        };

        const intranet = sheValid.isNotNull(
          d.querySelector("#intranet a"),
          'd.querySelector("#intranet a")'
        )
        this.query_config = {
          "headers": {
              "accept": "application/json, text/javascript, */*; q=0.01",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "ml-contract": intranet.innerText,
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
      },  
      _manageOrderTextareaCreating() { 
        this.productTabs.insertAdjacentHTML(
          "beforeend",
          '<textarea ' + 
            sheConfig.style +
            'placeholder="Вставьте заказ и нажмите Ctrl+Delete" ' + 
            'style="margin-left: 90px;" ' + 
            'rows="5" ' + 
            'cols="30" ' + 
            'id="textareaOrder">' +
          '</textarea>'
        );

        this.textareaOrder = document.querySelector("#textareaOrder");

        this.textareaOrder.addEventListener(
          "keydown",
          (e) => {
            if(e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              this._handleOrderTextareaEvent.call(this)
            }
          }
        );
      },
      async _handleOrderTextareaEvent() {
        const factureDataElement = document.querySelectorAll(
            "#delBox div table tbody tr td"
        );

        sheValid.isNotNull(
          factureDataElement, 
          'document.querySelectorAll("#delBox div table tbody tr td")'
        );

        this.query_order = {
          positions: [],
          factureId: factureDataElement[0]?.innerText
        };

        this.textareaOrder.disabled = true;
        this._prepareOrderObject.call(this);

        async function* generator() {
          for (let index = 0; index < this.order.length; index++) {
            await this._handleOrderLine.call(this, this.order[index]);
            this.textareaOrder.value = "Прогресс: " + (index+1) + "/" + this.order.length;
            yield index;
          }
        }

        for await (let value of generator.call(this)) {}

        this._turnQueryOrderToQueryConfig.call(this);

        let promise = await fetch("/ru/store/header/new/addproducts/", this.query_config);
        let promise_text = await promise.text();

        alert("Готово. Большинство пропущенных позиций указано в поле для таблицы");

        this.textareaOrder.value = this._skippedToTextarea.call(this);
      },
      _skippedToTextarea() {
        let string = "Пропущенные позиции: ";
        for (let line = 0; line < this.skipped.length; line++) {
          string += line + ", ";
        }
        return string;
      },
      _turnQueryOrderToQueryConfig() {
        let body = "factura_id=" + this.query_order.factureId;
        for (let line of this.query_order.positions) {
          body += "&" + line.name + "=" + line.amount;
        }
        this.query_config["body"] = body;
      },
      _prepareOrderObject() {
        this.order = [];
        for ( let raw_line of this.textareaOrder.value.split("\n") ) {
          let line = raw_line.split("\t");
          if (line[0] === "Код") continue;
          this.order.push(line);
        }
      },
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
      },
      _handleProductAddingToQueryOrder(line) {
        let amount_inputs = sheValid.isNotNull(
          document.querySelectorAll("#productForm table input"),
          'document.querySelectorAll("#productForm table input")'
        );
        let remain_td = sheValid.isNotNull(
          document.querySelectorAll("#productForm tbody tr td"),
          'document.querySelectorAll("#productForm tbody tr td")'
        );
        if (
          amount_inputs.length > 1 || 
          !document.querySelector("#prodList form") ||
          +remain_td[3].innerText < line[this.amount_column]
        ) 
        {
            this.skipped.push(line);
            return;
        }
        this.query_order.positions.push({
          name: sheValid.isNotNull( 
            document.querySelectorAll("#productForm table input"),
            'document.querySelectorAll("#productForm table input")'
          )[0].name,
          amount: line[this.amount_column],
        });
      }
    },
  }
}

sheContent.init();

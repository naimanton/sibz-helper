var l = console.log;
var qw = console.log;
var sheConfig = {
  textareaCols: 'cols="25" ',
  style: 'style="border: orange 2px solid; '+ 
    'padding: 5px; '+ 
    'background-color: lightyellow" ', // end-space required
    // productsCodesJSON: ``
}
var vfy = function (assertion, description) {
  if ( assertion !== true && assertion !== false ) {
    throw new Error("conditionWrapper-parameter must return boolean value.");
  }

  if (!assertion) {
    throw new Error(
      JSON.stringify({
        description
      }, false, 4)
    );
  }
  console.log('Sibz Helper Extension: (' + description + ") was verified." )
};
var vfyEl = function (selector) {
	var el = document.querySelector(selector);
	vfy(el instanceof HTMLElement, selector + ' not found.');
	return el;
};
function getCookie(a){for(var b=document.cookie.split(";"),e,c=0;c<b.length;c++){var d=b[c].trim();0===d.indexOf(a+"\x3d")&&(e=d.substring((a+"\x3d").length,d.length))}return e}
var includesAnyOf = (string, array) => {
  for (var elem of array) {
    if (string.includes(elem)) {
      return true;
    }
  }
  return false;
};
var sheContent = {
  init() {
    l('SHE: sheContent initializing...');
    this.pathnames = {
      order: "/ru/store/header/order/showcase/new/",
      facture: "/ru/store/header/new/edit/",
      factureCreating: "/ru/store/header/new/create/",
      headerNew: "/ru/store/header/new/",
      wellnessCart: "/kz-ru/cart/",
      factureList: "/store/header/index/list/",
    };
    this.choice = {};
    l("SHE: Scripts' choosing...");
    this.chooseScript.call(this, document.location.pathname);
    l('SHE: sheContent initialized.')
    return this;
  },
  chooseScript(pathname) {
    // this.choice.fetchReassigning = this.scripts.fetchReassigning.init();
    if (pathname.includes('/ru/') && document.body.innerText.includes('Страница доступна только авторизованным пользователям. Пожалуйста, введите ваш логин и пароль на странице')) {
      var links = document.querySelectorAll('a');
      for (var li of links) {
        if (li.href.includes('/login')) {
          // li.dispatchEvent(new Event('click', {bubbles:true}))
          document.location.href = li.href; 
          return;
        }
      }
      return;
    }
    if (pathname === this.pathnames.order) {
      this.choice.autoOrder = this.scripts.autoOrder.init();
      this.choice.formatProduct = this.scripts.formatProduct.init();
      this.choice.orderBackup = this.scripts.orderBackup.init();
      this.choice.orderCleaning = this.scripts.orderCleaning.init();
    }
    else if (pathname === this.pathnames.facture) {
    	this.choice.selectCodesByNames = this.scripts.selectCodesByNames.init();
      this.choice.autoFacture = this.scripts.autoFacture.init();
      this.choice.factureToOrder = this.scripts.factureToOrder.init();
    }
    else if (pathname === this.pathnames.headerNew) {
    	this.choice.moreInfoAboutCustomer = this.scripts.moreInfoAboutCustomer.init();
    }
    else if (pathname === this.pathnames.wellnessCart) {
      this.choice.wellnessCartProductSearch = this.scripts.wellnessCartProductSearch.init();
    }
    else if (pathname === this.pathnames.factureCreating) {
    	this.choice.editButtonForNewCreate = this.scripts.editButtonForNewCreate.init();
    	this.choice.selectCodesByNames = this.scripts.selectCodesByNames.init();
    }
    else if (pathname.includes(this.pathnames.factureList)) {
      this.choice.factureListContractFinder = this.scripts.factureListContractFinder.init();
    }

    if (
      pathname === this.pathnames.facture ||
      pathname === this.pathnames.factureCreating
    ) 
    {
      this.choice.allFactureItemsCheckbox = (
        this.scripts.allFactureItemsCheckbox.init()
      );
    }
  },
  scripts: {
    // fetchReassigning: {
    //   init() {
    //     eval('alert("мда")')
    //     window['yaReqCounter'] = 0;
    //     window['_fetch'] = fetch;
    //     window['fetch'] = function (...args) {
    //       if (arg[0].includes('yandex')) {
    //         window['yaReqCounter']++;
    //         return;
    //       }
    //       return window["_fetch"](...args);
    //     }
    //     return this;
    //   },
    // },
    factureListContractFinder: {
      init() {
        var inputs = [...document.querySelectorAll('#contract')];
        for (var i = 0; i < inputs.length; i++) {
          this.handleContractInputSearchUpgrade.call(
            this, inputs[i], 'sheContractsDatalist' + i
          );
        }
        return this;
      },
      handleContractInputSearchUpgrade(input, newDatalistId) {
        input.placeholder = 'Имя (Enter)';
        input.insertAdjacentHTML('afterend', `<datalist id="${newDatalistId}"></datalist>`)
        input.setAttribute('list', newDatalistId);
        input.addEventListener('change', ((newDatalistId,e) => {
          var datalist = document.querySelector('#' + newDatalistId);
          if (e.target.value.length < 4) {
            datalist.innerHTML = '';
            return;
          }
          var isIncludingAnyNumber = includesAnyOf(
            e.target.value,
            "0123456789".split('')
          );
          if (isIncludingAnyNumber) return;
          this.fetchContract(e.target.value).then(((datalist,res) => {
            var options = ''
            var opts = res.data.slice();
            opts.sort( (a,b) => a.is_closed - b.is_closed)
            for (var opt of opts) {
            var closed = '';
            if (opt.is_closed != 0) {
              closed = '[Закрыт]'
            }
              options += `<option value="${opt.contract}">${closed} ${opt.name}, ${opt.city_name}</option>`
            }
            datalist.innerHTML = options;
          }).bind(this, datalist));

        }).bind(this, newDatalistId))
      },
      fetchContract(pattern) {
        return fetch(`https://kz.siberianhealth.com/ru/store/header/new/search_customer/?pattern=${pattern}&isShowingClosed=1`, {
          "headers": {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "ml-contract": "M11123",
            "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
          },
          "referrer": "https://kz.siberianhealth.com/ru/store/header/new/",
          "referrerPolicy": "strict-origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors",
          "credentials": "include"
        }).then(p=> p.json());
      },
    },
    wellnessCartProductSearch: {
      autocompleteApiKey: 'JC5KJBC11N',
      productSize: 30,
      perPage: 30,
      searchResultData: null,
      clickedTr: null,
      defaultPlace: {
        cityId: 267,
        regionId: 22,
      },
      image: {
        height: 100,
        width: 100,
      },
      init() {
        this.definedPlace = this.definePlace();
        if (this.definedPlace === false) {
          this.definedPlace = this.defaultPlace;
        }
        document.head.insertAdjacentHTML(
          'beforeend',
          `<style>
            #sheProductSearch {
              background-color: #f4f4f4;
              overflow-wrap: break-word;
            }
            #sheProductSearchTable td {
              border: 1px solid;
            }
            #sheProductSearchTable a:hover {
              color: rgb(102, 65, 240);
            }
            #sheGlobTr > td {
              max-width: 50%;
            }
          </style>`
        );
        document.body.insertAdjacentHTML(
          'afterend',
          `<div id="sheProductSearch">
            Идентификатор города: ${this.definedPlace.cityId} (267 - Караганда). <br>
            <input style="padding: 5px;" id="sheProductSearchInput" placeholder="Поиск (Enter)">
            <table>
              <tr id="sheGlobTr">
                <td valign="top" ><table id="sheProductSearchTable"></table></td>
                <td valign="top" id="sheProductSearchInfo"></td>
              </tr>
            </table>
          </div>`
        );
        sheProductSearchInput.addEventListener('change', () => {
          if (sheProductSearchInput.value === '') {
            sheProductSearchTable.innerHTML = ''
            sheProductSearchInfo.innerHTML = ''
            return;
          }
          this.search.call(this, sheProductSearchInput.value, this.productSize, this.perPage)
          .then(r => {
            var list = this.sift.call(this, r.List);
            this.searchResultData = list;
            this.visualizeSearchResult.call(this, sheProductSearchTable, list);
          })
        });
        sheProductSearchTable.addEventListener('click', e => {
          if (e.target.src === undefined) return;
          if (this.clickedTr) {
            this.clickedTr.style.backgroundColor = '';
          } 
          var path = e.composedPath();
          this.clickedTr = path[2];
          this.clickedTr.style.backgroundColor = 'white';
          var index = path[2].getAttribute('data-sheIndex');
          qw(this.searchResultData);
          sheProductSearchInfo.innerHTML = '<b>' + path[2].children[2].innerHTML + '</b>' + 
            '<hr><h3>Применение: </h3><br>' + this.searchResultData[index].useWay + 
            '<hr><h3>Состав: </h3><br>' + this.searchResultData[index].composition + 
            '<hr><h3>Описание: </h3><br>' + this.searchResultData[index].description
        });
      },
      definePlace() {
        var cityId = getCookie('currentCityId');
        var regionId = getCookie('RegionId');
        if (isFinite(cityId) && isFinite(regionId)) {
          return {cityId, regionId}; 
        }
        return false;
      },
      sift(productList) {
        var result = [];
        for (var line of productList) {
          var simple = {
            options: [],
            code: line.Code,
            price: line.Price,
            url: line.UrlCode,
            points: line.Point,
            weight: line.Weight,
            discount: line.Discount,
            fullName: line.NameFull,
            oldPrice: line.OldPrice,
            useWay: line.UseWayText,
            description: line.Description,
            isOnlyOnline: line.IsOnlyOnline,
            remain: line.ProductSaldo.Volume,
            composition: line.FullComposition,
          };
          if (line.Images && line.Images[0] && line.Images[0].Url) {
            simple.smallImageUrl = line.Images[0].Url;
          }
          if (line.SaleEndDate[0] !== '0') {
            simple.sale = {
              startDate: this.beautifySaleDate(line.SaleStartDate),
              endDate: this.beautifySaleDate(line.SaleEndDate),
            }
          }
          else if (line.Discount !== 0) {
            simple.sale = {
              startDate: 'месяц',
              endDate: 'месяц',
            } 
          }
          else {
            simple.sale = {
              startDate: '',
              endDate: '',
            } 
          }
          if (line.ProductOptions !== null) {
            for (var option of line.ProductOptions) {
              simple.options.push({
                name: option.Name,
                value: option.Value,
              });
            }
          }
          result.push(simple);
        }
        return result;
      },
      beautifySaleDate(date) {
        var splitted = date.split('T');
        splitted = [splitted[0], splitted[1].split('+')[0].replace('Z', '')];
        return splitted.join(' - ');
      },
      search(st, productSize, perPage) {
        return this.fetch.autocomplete.call(this,st, productSize)
        .then(r => this.fetch.product(this.makeCodes(r), perPage, this.definedPlace.cityId, this.definedPlace.regionId));
      },
      makeCodes(autocompleteResult) {
        vfy(typeof autocompleteResult === 'object' && autocompleteResult !== null);
        vfy(autocompleteResult.products.length !== undefined);
        var result = '';
        for (var product of autocompleteResult.products) {
          result += `Codes[]=${product.id}&`
        }
        return result;
      },
      visualizeSearchResult(table, productList) {
        var html = `<tr>
            <td>Карт.</td>
            <td>Код</td>
            <td>Название</td>
            <td>Остаток</td>
            <td>Баллы</td>
            <td>Цена</td>
            <td>Скидка</td>
          </tr>`;
        for (var index = 0; index < productList.length; index++) {
          var item = productList[index];
          var discPerc = (+item.oldPrice - +item.price) / +item.oldPrice * 100; 
          html += `<tr data-sheIndex="${index}" >
            <td><img height="${this.image.height}" width="${this.image.width}" src="${item.smallImageUrl}"></td>
            <td><a href="${item.url}" target="_blank">${item.code}</a></td>
            <td>${item.fullName}<br>${this.stringifyOptions(item.options)}</td>
            <td>${item.remain}</td>
            <td>${item.points}</td>
            <td title="Только ИМ: ${item.isOnlyOnline ? 'Да' : 'Нет'}">${item.price}</td>
            <td>${discPerc}%; ${item.discount} тенге<hr>Без скидки: ${item.oldPrice}<hr>с ${item.sale.startDate}<hr>до ${item.sale.endDate}</td>
          </tr>`;
        }
        table.innerHTML = html;
      },
      stringifyOptions(options) {
        var result = '';
        for (var op of options) {
          result += op.name + ' - ' + op.value + '; ';
        }
        return result;
      },
      fetch: {
        autocomplete(st, productSize) {
          return fetch(`https://autocomplete.diginetica.net/autocomplete?st=${st}&productsSize=${productSize}&apiKey=${this.autocompleteApiKey}&regionId=global&strategy=vectors_extended,zero_queries_predictor&forIs=true&showUnavailable=false&withContent=false&withSku=false&RegionId=22&LanguageId=9&UserTimeZone=6&CityId=4`, {
            "headers": {
              "accept": "application/json, text/plain, */*",
              "accept-language": "ru,en-US;q=0.9,en;q=0.8,bg;q=0.7",
              "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "cross-site",
              "token": getCookie('token')
            },
            "referrer": "https://kz.siberianwellness.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
          }).then(p => p.json().then(r => r));
        },
        product(codes, perPage, cityId, regionId) {
          return fetch(`https://kz.siberianwellness.com/api/v1/product?${codes}CurrentPage=1&PerPage=${perPage}&CityId=${cityId}&RegionId=${regionId}&LanguageId=9&InputSearch=true&IsActive=true&SortBy=code&UserTimeZone=6`, {
            "headers": {
              "accept": "application/json, text/plain, */*",
              "accept-language": "ru,en-US;q=0.9,en;q=0.8,bg;q=0.7",
              "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "token": getCookie('token')
            },
            "referrer": "https://kz.siberianwellness.com/kz-ru/?mobileActiveType=menu&menu=main%2F1",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
          }).then(p => p.json().then(r => r));
        }
      }
    },
  	selectCodesByNames: {
  		async init() {
  			let pool = [];
  			let datalist = `<datalist id="sheCodesDatalist">`;
        // let codesFetch = await fetch('https://api.npoint.io/b9fc88f0cb80f8f285b0');
        // let codes = await codesFetch.json();
        // let codes = JSON.parse(`[["Siberian Health - Зубная щетка Nano Silver ()",105578],["Бальзам Живокост - Бальзам с экстрактом окопника, глюкозамином и хондроитином (100 мл / 3.52 fl oz)",402692],["ПИК-порошок - Природный инулиновый концентрат ()",400237],["ЭПАМ 1000 (30 мл)",400264],["ЭПАМ 11 (30 мл)",400265],["ЭПАМ 24 (30 мл)",400266],["ЭПАМ 31 (30 мл)",400267],["ЭПАМ 4 (30 мл)",400268],["ЭПАМ 44 (30 мл)",400270],["ЭПАМ 7 (30 мл)",400271],["ЭПАМ 900 (30 мл)",400273],["ЭПАМ 96 (30 мл)",400274],["Истоки чистоты - Набор для комплексного очищения организма ()",400753],["Siberian Нealth - Зубная щетка Nano Silver (зеленый)",104747],["Siberian Нealth - Зубная щетка Nano Silver (оранжевый)",104854],["Духаал аза - Капля счастья - Согревающее массажное масло ()",401833],["Siberian Wellness - Фитнес резинка (600х50х0,7 мм; латекс; голубой)",107327],["Siberian Wellness - Пакет подарочный (большой) (крафт)",107525],["Пакет полиэтиленовый с логотипом Компании Siberian Wellness (40х50 см; белый)",107313],["Experalta Platinum - Косметический дроппер (1 штука)",107557],["Experalta Platinum - Омолаживающий тоник-софтнер ()",408253],["Experalta Platinum - Мицеллярная вода для снятия макияжа (200 мл)",408369],["SPA Collection - Увлажняющее молочко для тела Лесная земляника & зеленый чай (250 мл)",410019],["Experalta Platinum - Эксфолиант для очищения пор (100 мл / 3.52 fl oz)",408371],["Experalta Platinum - Интеллектуальная сыворотка (50 мл)",409280],["Корень - Бальзам широкого спектра действия ()",402860],["Experalta Platinum - Очищающее масло для умывания (200 мл)",408368],["ВИТАМАМА BABY - Детское мыло-пенка на ромашковой воде (250 мл)",404242],["ВИТАМАМА BABY - Бальзам для купания на ромашковой воде (200 мл)",404241],["ВИТАМАМА BABY - Детский крем на ромашковой воде (200 мл)",404240],["SPA Collection - Увлажняющий гель-крем для душа Лесная земляника & зеленый чай (250 мл)",410022],["SPA Collection - Увлажняющее молочко для тела Кедр & яблоко (250 мл)",410018],["косметика с комплексом ENDEMIX™ - Крем-комплекс для зрелой кожи (50 мл)",404778],["косметика с комплексом ENDEMIX™ - Крем для лица увлажняющий (50 мл)",404777],["косметика с комплексом ENDEMIX™ - Крем-масло для тела питательный (150 мл)",409978],["E.N.I.G.M.A. - Суперстойкая тушь для ресниц (ультрачерная) (10 г; ультрачерный)",407676],["Сибирские бальзамы - Бальзам широкого спектра действия «Корень» (250 мл)",409066],["косметика с комплексом ENDEMIX™ - Дезодорант для тела (60 мл)",406402],["Сибирские бальзамы - Бальзам-флорасептик «Эльбэшэн» (250 мл; 250 мл)",409069],["Сибирские бальзамы - Пихтовый бальзам для растираний (50 мл)",409064],["косметика с комплексом ENDEMIX™ - Крем для век обновляющий с Q10 (15 мл)",411212],["Experalta Platinum - Криолифтинговая маска для лица (50 мл)",410091],["Siberian Super Natural Sport - Спортивный восстанавливающий гель (100 мл / 3.52 fl oz)",410054],["Experalta Platinum - Гидрогелевые патчи для кожи вокруг глаз (60 штук)",410682],["косметика с комплексом ENDEMIX™ - Део-гель для женской интимной гигиены (150 мл)",411576],["косметика с комплексом ENDEMIX™ - Маска для лица питательная (100 мл / 3.52 fl oz)",410277],["«Черника & древесный уголь», биоактивная зубная паста (75 мл)",411381],["«Земляника & красная глина», комплексная зубная паста (75 мл)",411380],["косметика с комплексом ENDEMIX™ - Пенка для интимной гигиены (150 мл)",411575],["«Кинотто & лемонграсс», освежающая зубная паста (75 мл)",411379],["косметика с комплексом ENDEMIX™ - Крем для лица обновляющий (50 мл)",411211],["Сибирская облепиха - Зубная паста. Ежедневный уход и снижение чувствительности (100 мл / 3.52 fl oz)",411378],["Bionética - Насыщенный крем для лица ()",410241],["Bionética - Насыщенный крем для лица (7 мл)",410283],["Bionética - Тотальная сыворотка красоты (50 мл)",411374],["Bionética - Тотальная сыворотка красоты ()",411375],["Сибирский прополис - Зубная паста Натуральная защита (100 мл / 3.52 fl oz)",411376],["Experalta Platinum - Антицеллюлитный концентрат (150 мл)",411382],["косметика с комплексом ENDEMIX™ - Крем для ног (комплексный уход) (75 мл)",411567],["косметика с комплексом ENDEMIX™ - Фитомыло для женской интимной гигиены (300 мл)",411568],["GREEN-мыло для кухни ()",412254],["косметика с комплексом ENDEMIX™ - Антибактериальный спрей для интимной гигиены (60 мл)",411578],["косметика с комплексом ENDEMIX™ - Солнцезащитное молочко для тела SPF 30 (100 мл / 3.52 fl oz)",412270],["косметика с комплексом ENDEMIX™ - Крем для лица дневной SPF 15 с антиоксидантами (50 мл)",411583],["косметика с комплексом ENDEMIX™ - Антиоксидантный тоник для лица (200 мл)",411582],["косметика с комплексом ENDEMIX™ - Крем для лица с омега-кислотами (75 мл)",411586],["косметика с комплексом ENDEMIX™ - Гель для умывания с комплексом жирных кислот омега-3, -6, -7, -9 (300 мл)",411585],["косметика с комплексом ENDEMIX™ - Крем для лица ночной с антиоксидантами (50 мл)",411584],["E.N.I.G.M.A. - Стойкий карандаш для бровей (тауп) (тауп; 0,35 г)",412662],["E.N.I.G.M.A. - Стойкий карандаш для бровей (насыщенный коричневый) (насыщенный коричневый; 0,35 г)",412663],["E.N.I.G.M.A. - Стойкий карандаш для глаз (черный) (черный; 0,4 г)",412671],["косметика с комплексом ENDEMIX™ - Крем для век с омега-кислотами (15 мл)",411587],["Experalta Platinum - Интеллектуальный крем (50 мл)",413494],["«Живокост», восстанавливающий бальзам форте (100 мл / 3.52 fl oz)",415535],["Experalta Platinum - Интеллектуальный крем (сменный блок) (50 мл)",413495],["Сибирские бальзамы - «Уян Номо», бальзам для тела (100 мл / 3.52 fl oz)",414328],["косметика с комплексом ENDEMIX™ - Пилинг для лица энзимный (50 мл)",415754],["косметика с комплексом ENDEMIX™ - Шампунь для объема волос (250 мл)",416042],["косметика с комплексом ENDEMIX™ - Кондиционер для волос увлажняющий (250 мл)",416040],["косметика с комплексом ENDEMIX™ - Шампунь увлажняющий (250 мл)",416039],["E.N.I.G.M.A. - Суперстойкая тушь для ресниц (коричневая) (10 г; коричневый)",416095],["Сибирские бальзамы - Восстанавливающий бальзам (30 мл)",416558],["Горная лаванда - Зубная паста Антибактериальная защита (100 мл / 3.52 fl oz)",417381],["L'INSPIRATION DE SIBÉRIE Olkhon, парфюмерная вода ()",419221],["косметика с комплексом ENDEMIX™ - Гель для рук антибактериальный (50 мл)",416931],["Морской кальций - Зубная паста Интенсивное укрепление эмали (100 мл / 3.52 fl oz)",417382],["Сибирские бальзамы - Тонизирующий крем для ног (75 мл)",416559],["Сибирские бальзамы - Восстанавливающий гель с пантенолом (40 мл)",417706],["Сибирские бальзамы - «Корень», бальзам-концентрат для массажа - Сибирские бальзамы (100 мл / 3.52 fl oz)",417917],["косметика с комплексом ENDEMIX™ - Шампунь восстанавливающий (250 мл)",416044],["косметика с комплексом ENDEMIX™ - Маска для волос восстанавливающая (200 мл)",416046],["косметика с комплексом ENDEMIX™ - Кондиционер для волос восстанавливающий (250 мл)",416045],["косметика с комплексом ENDEMIX™ - Кондиционер для объема волос (250 мл)",416043],["косметика с комплексом ENDEMIX™ - Шампунь для роста волос (250 мл)",417704],["Experalta Platinum - Ампульный концентрат с бакучиолом (30 мл)",416108],["Experalta Platinum - Ампульный концентрат «Возрождение» (30 мл)",416105],["Experalta Platinum - Ампульный концентрат «Лифтинг и упругость» (30 мл)",416107],["Experalta Platinum - Ампульный концентрат «Увлажнение» (30 мл)",416106],["Siberian Wellness - Гель для душа с конопляным маслом ()",419020],["Siberian Wellness - Крем для тела с конопляным маслом ()",419021],["Siberian Super Natural Sport - Мегавитамины ()",500284],["Истоки чистоты. Renaissance Triple Set - Премиум набор для комплексного очищения организма ()",500213],["Siberian Super Natural Sport - Глюкозамин и хондроитин ()",500276],["Siberian Super Natural Sport - Комплекс аминокислот BCAA (120 таблеток)",500277],["Синхровитал VII - Хронобиологическая защита зрения (60 капсул)",500050],["Новомин ()",500020],["Синхровитал VI - Хронобиологическая защита суставов (60 капсул)",500065],["Синхровитал II - Хронобиологическая защита клеток мозга (60 капсул)",500071],["Адаптовит - Энергомодулирующий комплекс в формате спрея (10 мл)",500094],["Синхровитал IV - Хронобиологическая защита печени (60 капсул)",500130],["Набор Тригельм - Антипаразитарная защита (90 капсул и 200 г)",500116],["ВитаМама - Драже Топивишка ()",500120],["ВитаМама - Драже Витаминка ()",500163],["Набор Daily Box - Beauty Box / Красота и сияние (30 пакетов по 2 капсулы)",500172],["Набор Daily Box - IQ Box / Интеллект (30 пакетов по 2 капсулы)",500175],["Истоки Чистоты. Формула 3 - Антиоксидантный комплекс ()",500113],["Ритмы здоровья - Витаминно-минеральный комплекс ()",500048],["L'INSPIRATION DE SIBÉRIE - Dynamique (Динамика), парфюмерная вода ()",419224],["L'INSPIRATION DE SIBÉRIE - Absolu (Абсолют), парфюмерная вода ()",419226],["L'INSPIRATION DE SIBÉRIE - Évolucion (Эволюция), парфюмерная вода ()",419225],["Набор Daily Box - Mama Box / Здоровая мама (30 пакетов с набором капсул)",500362],["Набор Daily Box - Vision Box / Острое зрение (30 пакетов по 4 капсулы)",500361],["Набор Daily Box - Pulse Box / Пульс бокс (30 пакетов по 3 капсулы)",500443],["Siberian Super Natural Nutrition - Neurovision ()",500481],["Siberian Super Natural Nutrition - Natural Vitamins (30 пакетов по 4 капсулы)",500469],["Siberian Super Natural Sport - L-карнитин (120 капсул)",500285],["Набор Daily Box - Immuno Box / Иммуно бокс (30 пакетов по 3 капсулы)",500526],["СoreNRG - Универсальный иммунобустер (30 мл)",500327],["Yoo Gо - Жевательный мармелад с облепихой и корицей (90 г)",500514],["3D Protection Cube (30 пакетов по 3 капсулы)",500440],["Siberian Super Natural Sport - Омега-3 Ультра ()",500484],["Yoo Gо - Напиток Young & Beauty (Красота и молодость) ()",500513],["Yoo Gо - Напиток Pure Heart (Чистое сердце) ()",500512],["Набор Daily Box - Lite Step Box / Легкая походка (30 пакетов по 2 капсулы и 1 таблетке)",500467],["Yoo Gо - Жевательный мармелад с черникой (90 г)",500427],["Yoo Gо - Жевательный мармелад с малиной и шиповником (90 г)",500515],["Хронолонг - Аnti-age комплекс ()",500449],["Yoo Gо - Beauty-батончик Лесные ягоды (50 г)",500504],["Yoo Gо - Питательный коктейль Яблоко-корица (7 саше)",500519],["Yoo Gо - Питательный коктейль Какао-имбирь (7 саше)",500541],["Yoo Gо - Turbo Tea (Очищающий турбочай) (30 фильтр-пакетов)",500590],["Yoo Go - Напиток Weight Control (яблоко-лимон) ()",500543],["CoreNRG - Жевательный мармелад с прополисом ()",500563],["3D Hair & Nails Cube (30 пакетов по 3 таблетки)",500571],["Baikal Tea Collection - Фиточай из диких трав № 4 (Легкое дыхание) (30 фильтр-пакетов)",500584],["Yoo Gо - Питательный коктейль Кокосовое печенье (7 порций по 25 г)",500564],["3D Bone Vegan Cube ()",500572],["Yoo Gо - Calcium-батончик Кокос (50 г)",500566],["Baikal Tea Collection - Фиточай из диких трав № 1 (Очищение и дренаж) (30 фильтр-пакетов)",500581],["Baikal Tea Collection - Фиточай из диких трав № 2 (Женская гармония) (30 фильтр-пакетов)",500582],["Baikal Tea Collection - Фиточай из диких трав № 3 (Природный антистресс) (30 фильтр-пакетов)",500583],["Baikal Tea Collection - Фиточай из диких трав № 5 (Комфортное пищеварение) (30 фильтр-пакетов)",500585],["Baikal Tea Collection - Фиточай из диких трав № 6 (Защита печени) (30 фильтр-пакетов)",500586],["Baikal Tea Collection - Фиточай из диких трав № 7 (Легкость движений) (30 фильтр-пакетов)",500587],["Baikal Tea Collection - Фиточай из диких трав № 8 (Сердечный комфорт) (30 фильтр-пакетов)",500588],["Baikal Tea Collection - Фиточай из диких трав № 9 (Углеводный контроль) (30 фильтр-пакетов)",500589],["Essential Vitamins - Бетаин и В-витамины ()",500625],["Essential Vitamins - Северная клюква и В-витамины ()",500577],["Essential Vitamins - Диосмин и рутин ()",500626],["Essential Minerals - Органическое железо ()",500627],["Siberian Super Natural Nutrition - BeautySense (20 пакетов по 3 капсулы)",500650],["Essential Sorbents - Очищающий фитосорбент Pure Life ()",500632],["Essential Sorbents - Cуставной фитосорбент Joint Comfort ()",500633],["Essential Sorbents - Кишечный фитосорбент Intestinal Defense ()",500634],["Essential Minerals - Органический кальций ()",500628],["Essential Minerals - Органический магний ()",500629],["Essential Minerals - Органический селен ()",500630],["Essential Minerals - Органический цинк (60 капсул)",500631],["Essential Botanics - Арония и лютеин ()",500653],["Essential Botanics - Гинкго билоба и байкальский шлемник ()",500654],["Essential Botanics - Йохимбе и сибирский женьшень ()",500655],["Essential Botanics - Медвежьи ушки и брусника ()",500656],["Essential Botanics - Валериана и мелисса ()",500657],["Essential Minerals - Органический йод ()",500658],["Essential Fatty Acids - Северная омега-3 ()",500661],["Yoo Gо - Antistress-батончик (карамель и фундук) (25 г)",500644],["Essential Vitamins - Глюкозамин и хондроитин ()",500651],["Essential Vitamins - Витамины красоты ()",500652],["Essential Fatty Acids - Бораго и амарант ()",500659],["Essential Fatty Acids - Натуральный бета-каротин и облепиха ()",500660],["Yoo Go - Напиток Weight Control (малина-гранат) (14 порций по 5 г)",500713],["Essential Probiotics - Эльбифид ()",500663],["Essential Vitamins - Витамины с кальцием ()",500676],["Набор Daily Box - MAMA Box Беременность (30 пакетов по 2 капсулы и 2 таблетки)",500700],["Набор Daily Box - MAMA Box Грудное вскармливание (30 пакетов по 2 капсулы и 2 таблетки)",500701],["Essential Fatty Acids - Сибирский лен и омега-3 ()",500662],["Essential Fatty Acids - Лютеин и зеаксантин ()",500688],["Siberian Super Natural Sport - Хромлипаза ()",500874],["Набор 4 Wellness ()",500918],["Essential Vitamins - Витамин D3 ()",500820],["Чайный набор Baikal Tea Collection (40 фильтр-пакетов)",500856],["Новомин-N ()",500863],["Essential Minerals - Органический кальций ()",500914],["Essential Fatty Acids - Ликопин и омега-3 ()",500689],["Vitamama - Сироп для иммунитета Immunotops ()",500715],["Yoo Gо - Напиток Immuno Drink (Защита иммунитета) «Лимон-имбирь» (8 шт. по 10 г)",500958],["Yoo Gо - Натуральный жевательный мармелад (апельсин) (90 г)",500959],["Комплекс для контроля над стрессом RELAX Box ()",500931],["Siberian Super Natural Nutrition - Detox Pro.Active ()",500943],["Essential Minerals - Органический германий ()",500954],["Сывороточный протеин Fitness Catalyst (шоколадное печенье) (500 г)",500968],["Сывороточный протеин Fitness Catalyst (тирамису) (500 г)",500966],["Сывороточный протеин Fitness Catalyst (ванильное мороженое) (500 г)",500967],["Yoo Gо - Натуральный жевательный мармелад (черная смородина) (90 г)",500960],["Сывороточный протеин Fitness Catalyst (черничный чизкейк) (500 г)",500964],["Essential Sorbents - Очищающий фитосорбент Pure Life (саше) (10 порций по 7,5 г)",501001],["Siberian Health - Зубная щетка Nano Silver ()",104968],["Aromapolis Olfactive Studio - Golden Amber & Midnight Saffron, парфюмерная вода ()",417418],["Aromapolis Olfactive Studio - Fresh Fig & Sparkling Tangerine, парфюмерная вода ()",417419],["CoreNRG, природная профилактическая зубная паста ()",417379],["Набор Daily Box - GLUCO Box / Контроль уровня сахара (30 пакетов по 4 капсулы)",500952],["Vitamama - Calcitops, хрустящие шарики с какао-маслом (малина) ()",500670],["Yoo Gо - Напиток Antiox Drink «Облепиха-корица» ()",500957],["Experalta Platinum - Мягкий гель для умывания с пробиотиками ()",418443],["Experalta Platinum - Дневной крем с растительными пептидами ()",418445],["Fitness Catalyst - Метилсульфонилметан (90 капсул)",501031],["Кружка Wellness Generation (320 мл)",107624],["Крафт-пакет «Волшебства в новом году» (крафт; 26х26х12 см)",107610],["Siberian Wellness - Биокружка «Степной орел» (400 мл)",107695],["Siberian Wellness - Биокружка «Белый медведь» (400 мл)",107696],["Aromapolis Olfactive Studio - 6 Sextum, духи-концентрат ()",419969],["Aromapolis Olfactive Studio - 1 Primum, духи-концентрат ()",419967],["Experalta Aurum - Увлажняющий гель для умывания ()",418896],["Experalta Aurum - Пробуждающая сыворотка для лица ()",418895],["Experalta Chronolong - Укрепляющий крем для лица ()",402000],["E.N.I.G.M.A. - Жидкие румяна (персиковый румянец) ()",407730],["Experalta Platinum - Обновляющий ночной крем ()",418446],["E.N.I.G.M.A. - Жидкие тени для век (белая смородина) ()",419760],["Experalta Chronolong - Интенсивно увлажняющий крем для лица ()",420056],["E.N.I.G.M.A. - Жидкие тени для век (тутовая ягода) ()",419758],["E.N.I.G.M.A. - Жидкие тени для век (крыжовник) ()",419757],["E.N.I.G.M.A. - Жидкие румяна (малиновый румянец) ()",416774],["E.N.I.G.M.A. - Жидкие тени для век (бузина) ()",419759],["косметика с комплексом ENDEMIX™ - Крем для проблемной кожи ()",414563],["Experalta Aurum - Питательная маска для лица ()",418893],["Experalta Biomelle - Сыворотка с витамином С для снятия стресса кожи ()",419603],["Experalta Biomelle - Крем для кожи вокруг глаз ()",419610],["Experalta Biomelle - Восстанавливающий дневной крем для лица SPF 15 / PA +++ ()",419609],["Siberian Wellness - Биокружка «Снежный Барс» (400 мл)",107697],["косметика с комплексом ENDEMIX™ - Крем-уход для волос увлажняющий (100 мл / 3.52 fl oz)",416041],["Experalta Chronolong - Сыворотка для сияния и увлажнения кожи ()",420057],["Experalta Chronolong - Сыворотка, сужающая поры ()",420059],["Experalta Chronolong - Крем для сужения пор и выравнивания кожи ()",420058],["Yoo Gо - Beauty-мармелад с биотином (персик-манго) (90 г)",501063],["Fitness Catalyst - Напиток с аминокислотами (гуарана) (70 г (10 порций по 7 г))",501061],["Yoo Gо - Immuno-мармелад (тропические фрукты) (90 г)",501065],["Fitness Catalyst - L-аргинин (120 таблеток)",501092],["Vitamama - Dino Lactino, какао-напиток (80 г)",501101],["Essential Nutrimix - Венотоник с диосмином и полифенолами (пряная вишня) (8 шт. по 10 г)",501094],["косметика с комплексом ENDEMIX™ - Маска для лица матирующая ()",420757],["Experalta Platinum - The Body Lab, укрепляющий и моделирующий крем для тела ()",418447],["Рюкзак Wellness Revolution (1 штука)",107631],["косметика с комплексом ENDEMIX™ - Маска для лица обновляющая ()",420759],["косметика с комплексом ENDEMIX™ - Маска для лица очищающая ()",420758],["E.N.I.G.M.A. - Масло для губ (цвет: сладкий мед) (5,5 мл)",419767],["E.N.I.G.M.A. - Масло для губ (цвет: дикая малина) (5,5 мл)",419766],["Experalta Chronolong - Сыворотка для повышения упругости кожи (60 мл)",420055],["косметика с комплексом ENDEMIX™ - Бальзам-тоник после бритья (100 мл / 3.52 fl oz)",419583],["косметика с комплексом ENDEMIX™ - Крем для бритья (100 мл / 3.52 fl oz)",419582],["Experalta Platinum - Обновляющий и выравнивающий пилинг для лица (200 мл)",414339],["Vitamama - OMEGAlodon (манго), комплекс омега-3 кислот (30 капсул)",500846],["Vitamama - OMEGAlodon (мультифрукт), комплекс омега-3 кислот ()",500714],["Хромлипаза (120 капсул)",501081],["Ритмы здоровья (180 капсул)",501075],["Новомин (220 капсул)",501088],["Хронобиологическая защита печени Синхровитал IV (120 капсул)",501078],["Органический кальций (120 таблеток)",501084],["Гиалуроновая кислота и натуральный витамин С (60 капсул)",501111],["Коллекция ароматов Ciel - Demon du Ciel, парфюмерная вода для женщин (36 мл)",422767],["Коллекция ароматов Ciel - Nuage, парфюмерная вода (50 мл)",422768],["Коллекция ароматов Ciel - Episode 21, парфюмерная вода (50 мл)",422773],["Коллекция ароматов Ciel - Episode 19, парфюмерная вода (50 мл)",422774],["Коллекция ароматов Ciel - Absolute Ego, парфюмерная вода для мужчин (95 мл)",422769],["Коллекция ароматов Ciel - Episode 15, парфюмерная вода (50 мл)",422911],["Коллекция ароматов Ciel - Lady Vogue Soul, парфюмерная вода (40 мл)",422775],["Коллекция ароматов Ciel - Lady Vogue Dream, парфюмерная вода (40 мл)",422776],["Wellness-набор «Витамины для иммунитета» (2 продукта)",501153],["Wellness-набор «Омега-3 для всей семьи!» (2 продукта)",501155],["Коробка-сумочка Приятных подарков ()",107921],["Крафт-пакет Чудесных сюрпризов (крафт)",107901],["Experalta Platinum - Криолифтинговая маска для лица (50 мл)",418449],["Experalta Platinum - Очищающее масло для умывания (200 мл)",418442],["Experalta Platinum - Крем для повышения упругости кожи вокруг глаз (15 мл)",418448],["Aromapolis Olfactive Studio - Dark Vanilla & Cherry Blossom, гель для душа (100 мл / 3.52 fl oz)",421872],["Aromapolis Olfactive Studio - Dark Vanilla & Cherry Blossom, увлажняющее молочко для тела (100 мл / 3.52 fl oz)",421873],["Aromapolis Olfactive Studio - Fresh Fig & Sparkling Tangerine, гель для душа (100 мл / 3.52 fl oz)",421874],["Aromapolis Olfactive Studio - Fresh Fig & Sparkling Tangerine, увлажняющее молочко для тела (100 мл / 3.52 fl oz)",421875],["Lymphosan F Beauty (Лимфосан Ж) (90 г)",500044],["Aromapolis Olfactive Studio - L’essence de Taiga, духи-концентрат ()",411162],["SIBERIAN WELLNESS - Крем для рук обновляющий Siberian Herbs (50 мл)",421686],["Siberian Wellness - Крем для рук питательный Siberian Herbs (50 мл)",421685],["Vitamama - Dino Lactino, пектиновый сорбент (70 г)",501143],["Experalta Aurum - Питательный крем-бальзам для лица (50 мл)",420862],["Experalta Aurum - Увлажняющий крем-гель для лица (50 мл)",420861],["Experalta Aurum - Увлажняющий крем для век (15 мл)",420863],["косметика с комплексом ENDEMIX™ - Шампунь для волос и тела мужской (250 мл)",419577],["Yoo Gо - Питательный коктейль (апельсин-лайм) ()",501099],["Yoo Gо - Питательный коктейль (кофе-шоколад) ()",501098],["Yoo Gо - Питательный коктейль (персик-апельсин) (7 порций по 25 г)",501100],["Каталог 2023 - SPORT, HEALTH & BEAUTY ()",107937],["Масло массажное тонизирующее Siberian Herbs (100 мл / 3.52 fl oz)",422289],["Коллекция ароматов Ciel - Episode 01, парфюмерная вода (50 мл)",422772],["Масло массажное расслабляющее Siberian Herbs (100 мл / 3.52 fl oz)",422287],["Experalta Aurum - Мультиактивный крем для шеи и декольте (75 мл)",422395],["Vitamama - Immunotops, фруктовые жевательные таблетки с витаминами A, C и D (90 таблеток)",501072],["Vitamama - Dino Vitamino, сироп с витаминами и минералами ()",500927],["Yoo Gо - Relax-мармелад (карамель) (90 г)",501162],["Коллекция ароматов Ciel - Arc-en-ciel №19, парфюмерная вода (24 мл)",422914],["Крем для рук увлажняющий Siberian Herbs (50 мл)",421684],["Experalta Chronolong - Набор-дуэт «Для непревзойденно увлажненной кожи» ()",419595],["Experalta Chronolong - Набор-дуэт «Для кожи, безупречной даже вблизи» ()",419597],["Women's Health - D-манноза & Северная клюква ()",501200],["3D Men's Cube (30 пакетов по 2 капсулы и 4 таблетки)",500951],["Коллекция ароматов Ciel - Demi-Lune № 04, парфюмерная вода для мужчин (90 мл)",422771],["Лимфосан Базовый (90 г)",500193],["Цитрусовое драже с витаминами «Лопутоп» (120 капсул)",501223],["Каталог 2023 - SPORT, HEALTH & BEAUTY (1 штука)",107958],["косметика с комплексом ENDEMIX™ - Солнцезащитный крем для тела SPF 30 (100 мл / 3.52 fl oz)",423886],["косметика с комплексом ENDEMIX™ - Солнцезащитный крем для лица SPF 50 (50 мл)",423888],["Experalta Platinum - Восстанавливающая эссенция с ниацинамидом 10% (50 мл)",418451],["Fitness Catalyst - Пептиды морского коллагена Fitness Catalyst (оригинал) (200 г)",501152],["Fitness Catalyst - Таурин (60 капсул)",501217],["Пакет полиэтиленовый с логотипом Компании Siberian Wellness (белый; 30х40 см)",107463]]`);
  			let codes = JSON.parse(`[["Siberian Health - Зубная щетка Nano Silver (Цвет: синий;)","105578"],["Бальзам Живокост - Бальзам с экстрактом окопника, глюкозамином и хондроитином (Объем: 100 мл;)","402692"],["ПИК-порошок - Природный инулиновый концентрат (Количество в упаковке: 75 г;)","400237"],["ЭПАМ 1000 (Объем: 30 мл;)","400264"],["Корень - Бальзам широкого спектра действия (Объем: 250 ml;)","402860"],["ЭПАМ 11 (Объем: 30 мл;)","400265"],["ЭПАМ 24 (Объем: 30 мл;)","400266"],["ЭПАМ 31 (Объем: 30 мл;)","400267"],["ЭПАМ 4 (Объем: 30 мл;)","400268"],["ЭПАМ 44 (Объем: 30 мл;)","400270"],["ЭПАМ 7 (Объем: 30 мл;)","400271"],["ЭПАМ 900 (Объем: 30 мл;)","400273"],["ЭПАМ 96 (Объем: 30 мл;)","400274"],["Истоки чистоты - Набор для комплексного очищения организма (Количество в упаковке: 180 капсул (60 капсул в каждой формуле);)","400753"],["Siberian Нealth - Зубная щетка Nano Silver (Цвет: зеленый;)","104747"],["Siberian Нealth - Зубная щетка Nano Silver (Цвет: оранжевый;)","104854"],["ВИТАМАМА BABY - Бальзам для купания на ромашковой воде (Объем: 200 мл;)","404241"],["Siberian Wellness - Фитнес резинка (Размер: 600х50х0,7 мм;Материал: латекс;Цвет: голубой;)","107327"],["Siberian Wellness - Пакет подарочный (большой) (Материал: крафт;)","107525"],["Experalta Platinum - Косметический дроппер","107557"],["Косметика с комплексом ENDEMIX™ - Крем для век обновляющий с Q10 (Объем: 15 ml;)","411212"],["Experalta Platinum - Омолаживающий тоник-софтнер (Объем: 200 мл;)","408253"],["Experalta Platinum - Эксфолиант для очищения пор (Объем: 100 мл;)","408371"],["Experalta Platinum - Интеллектуальная сыворотка (Объем: 50 мл;)","409280"],["Косметика с комплексом ENDEMIX™ - Шампунь против перхоти (Объем: 250 ml;)","404788"],["ВИТАМАМА BABY - Детское мыло-пенка на ромашковой воде (Объем: 250 ml;)","404242"],["Косметика с комплексом ENDEMIX™ - Крем-комплекс для зрелой кожи (Объем: 50 мл;)","404778"],["Siberian Super Natural Sport - Спортивный восстанавливающий гель (Объем: 100 мл;)","410054"],["Experalta Platinum - Гидрогелевые патчи для кожи вокруг глаз (Количество в упаковке: 60 штук;)","410682"],["Косметика с комплексом ENDEMIX™ - Крем для лица увлажняющий","404777"],["Косметика с комплексом ENDEMIX™ - Крем-масло для тела питательный (Объем: 150 мл;)","409978"],["Косметика с комплексом ENDEMIX™ - Крем для лица обновляющий","411211"],["Bionética - Ультралегкий крем для лица (Объем: 50 мл;)","410240"],["Bionética - Ультралегкий крем для лица (Объем: 7 мл;)","410284"],["Сибирский прополис - Зубная паста Натуральная защита (Объем: 100 мл;)","411376"],["Сибирские бальзамы - «Уян Номо», дегтярный бальзам для тела (Объем: 50 мл;)","409063"],["Сибирские бальзамы - Бальзам широкого спектра действия «Корень» (Объем: 250 ml;)","409066"],["Косметика с комплексом ENDEMIX™ - Дезодорант для тела (Объем: 60 мл;)","406402"],["Сибирские бальзамы - Бальзам-флорасептик «Эльбэшэн» (Объем: 250 ml;Объем: 250 мл;)","409069"],["Сибирские бальзамы - Пихтовый бальзам для растираний (Объем: 50 мл;)","409064"],["Косметика с комплексом ENDEMIX™ - Антибактериальный спрей для интимной гигиены (Объем: 60 мл;)","411578"],["Косметика с комплексом ENDEMIX™ - Крем для ног антибактериальный (Объем: 75 мл;)","411588"],["Косметика с комплексом ENDEMIX™ - Део-гель для женской интимной гигиены (Объем: 150 мл;)","411576"],["Косметика с комплексом ENDEMIX™ - Крем для лица дневной SPF 15 с антиоксидантами (Объем: 50 мл;)","411583"],["«Черника & древесный уголь», биоактивная зубная паста (Объем: 75 мл;)","411381"],["Косметика с комплексом ENDEMIX™ - Антиоксидантный тоник для лица (Объем: 200 мл;)","411582"],["«Земляника & красная глина», комплексная зубная паста (Объем: 75 мл;)","411380"],["Косметика с комплексом ENDEMIX™ - Пенка для интимной гигиены (Объем: 150 мл;)","411575"],["Косметика с комплексом ENDEMIX™ - Крем для лица ночной с антиоксидантами (Объем: 50 мл;)","411584"],["«Кинотто & лемонграсс», освежающая зубная паста (Объем: 75 мл;)","411379"],["Сибирская облепиха - Зубная паста. Ежедневный уход и снижение чувствительности (Объем: 100 мл;)","411378"],["Experalta Platinum - Антицеллюлитный концентрат (Объем: 150 мл;)","411382"],["«Живокост», восстанавливающий бальзам форте (Объем: 100 мл;)","415535"],["Косметика с комплексом ENDEMIX™ - Крем для ног (комплексный уход) (Объем: 75 мл;)","411567"],["Experalta Platinum - Интеллектуальный крем (сменный блок) (Объем: 50 мл;)","413495"],["Сибирские бальзамы - «Уян Номо», бальзам для тела (Объем: 100 мл;)","414328"],["Косметика с комплексом ENDEMIX™ - Маска для лица отбеливающая (Объем: 50 мл;)","415753"],["Косметика с комплексом ENDEMIX™ - Пилинг для лица энзимный (Объем: 50 мл;)","415754"],["Косметика с комплексом ENDEMIX™ - Фитомыло для женской интимной гигиены (Объем: 300 ml;)","411568"],["Косметика с комплексом ENDEMIX™ - Тоник для лица увлажняющий (Объем: 200 мл;)","414810"],["Новомин (Количество в упаковке: 120 капсул;)","500020"],["Ритмы здоровья - Витаминно-минеральный комплекс (Количество в упаковке: 60 капсул (30 капсул в каждой формуле);)","500048"],[" Легендарные сибирские бальзамы  - Восстанавливающий бальзам (Объем: 30 мл;)","416558"],["Горная лаванда - Зубная паста Антибактериальная защита (Объем: 100 мл;)","417381"],["Косметика с комплексом ENDEMIX™ - Гель для рук антибактериальный (Объем: 50 мл;)","416931"],["Морской кальций - Зубная паста Интенсивное укрепление эмали (Объем: 100 мл;)","417382"],["Сибирские бальзамы - Тонизирующий крем для ног (Объем: 75 мл;)","416559"],["Сибирские бальзамы - Восстанавливающий гель с пантенолом (Объем: 40 мл;)","417706"],["Сибирские бальзамы - «Корень», бальзам-концентрат для массажа - Сибирские бальзамы (Объем: 100 мл;)","417917"],["Косметика с комплексом ENDEMIX™ - Шампунь восстанавливающий (Объем: 250 ml;)","416044"],["Косметика с комплексом ENDEMIX™ - Шампунь для объема волос (Объем: 250 мл;)","416042"],["Косметика с комплексом ENDEMIX™ - Маска для волос восстанавливающая (Объем: 200 мл;)","416046"],["Косметика с комплексом ENDEMIX™ - Шампунь увлажняющий (Объем: 250 ml;)","416039"],["Косметика с комплексом ENDEMIX™ - Шампунь для роста волос (Объем: 250 ml;)","417704"],["Experalta Platinum - Ампульный концентрат с бакучиолом (Объем: 30 мл;)","416108"],["Experalta Platinum - Ампульный концентрат «Возрождение» (Объем: 30 мл;)","416105"],["Experalta Platinum - Ампульный концентрат «Лифтинг и упругость» (Объем: 30 мл;)","416107"],["Experalta Platinum - Ампульный концентрат «Увлажнение» (Объем: 30 мл;)","416106"],["Siberian Wellness - Гель для душа с конопляным маслом","419020"],["Siberian Wellness - Крем для тела с конопляным маслом","419021"],["Набор Daily Box - Mama Box / Здоровая мама (Количество в упаковке: 30 пакетов по 3 капсулы и 2 таблетки;Количество в упаковке: 30 пакетов с набором капсул;)","500362"],["Набор Daily Box - Vision Box / Острое зрение (Количество в упаковке: 30 пакетов по 4 капсулы;)","500361"],["Siberian Super Natural Sport - Мегавитамины (Количество в упаковке: 120 таблеток;)","500284"],["Истоки чистоты. Renaissance Triple Set - Премиум набор для комплексного очищения организма (Количество в упаковке: 30 пакетов по 3 капсулы;)","500213"],["Siberian Super Natural Sport - L-карнитин (Количество в упаковке: 120 капсул;)","500285"],["СoreNRG - Универсальный иммунобустер (Объем: 30 мл;)","500327"],["Siberian Super Natural Sport - Глюкозамин и хондроитин (Количество в упаковке: 120 таблеток;)","500276"],["Siberian Super Natural Sport - Комплекс аминокислот BCAA (Количество в упаковке: 120 таблеток;)","500277"],["Синхровитал VII - Хронобиологическая защита зрения (Количество в упаковке: 60 капсул;)","500050"],["Синхровитал VI - Хронобиологическая защита суставов (Количество в упаковке: 60 капсул;)","500065"],["Синхровитал II - Хронобиологическая защита клеток мозга (Количество в упаковке: 60 капсул;)","500071"],["Синхровитал III - Хронобиологическая защита сердца (Количество в упаковке: 100 капсул;)","500072"],["Адаптовит - Энергомодулирующий комплекс в формате спрея (Объем: 10 мл;)","500094"],["Синхровитал IV - Хронобиологическая защита печени (Количество в упаковке: 60 капсул;)","500130"],["Набор Тригельм - Антипаразитарная защита (Количество в упаковке: 90 капсул и 200 г;)","500116"],["ВитаМама - Драже Топивишка (Количество в упаковке: 150 г;)","500120"],["ВитаМама - Драже Витаминка (Количество в упаковке: 100 г;)","500163"],["Набор Daily Box - Beauty Box / Красота и сияние (Количество в упаковке: 30 пакетов по 2 капсулы;Количество в упаковке: 30 пакетов с набором капсул;)","500172"],["Набор Daily Box - IQ Box / Интеллект (Количество в упаковке: 30 пакетов по 2 капсулы;Количество в упаковке: 30 пакетов с набором капсул;)","500175"],["Истоки Чистоты. Формула 3 - Антиоксидантный комплекс (Количество в упаковке: 120 капсул;)","500113"],["Набор Daily Box - Pulse Box / Пульс бокс (Количество в упаковке: 30 пакетов по 3 капсулы;)","500443"],["Siberian Super Natural Nutrition - Neurovision (Количество в упаковке: 20 пакетов по 3 капсулы;)","500481"],["Siberian Super Natural Nutrition - Natural Vitamins (Количество в упаковке: 30 пакетов по 4 капсулы;)","500469"],["Набор Daily Box - Immuno Box / Иммуно бокс (Количество в упаковке: 30 пакетов по 3 капсулы;)","500526"],["Yoo Gо - Detox-батончик со вкусом «Манго» (Количество в упаковке: 50 г;)","500490"],["Yoo Gо - Жевательный мармелад с облепихой и корицей (Количество в упаковке: 90 г;)","500514"],["3D Protection Cube (Количество в упаковке: 30 пакетов по 3 капсулы;)","500440"],["Yoo Gо - Напиток Young & Beauty (Красота и молодость) (Количество в упаковке: 5 порций по 10 г;)","500513"],["Yoo Gо - Напиток Pure Heart (Чистое сердце) (Количество в упаковке: 14 порций по 5 г;)","500512"],["Набор Daily Box - Lite Step Box / Легкая походка (Количество в упаковке: 30 пакетов по 2 капсулы и 1 таблетке;Количество в упаковке: 30 пакетов с набором капсул;)","500467"],["Yoo Gо - Жевательный мармелад с черникой (Количество в упаковке: 90 г;)","500427"],["Yoo Gо - Жевательный мармелад с малиной и шиповником (Количество в упаковке: 90 г;)","500515"],["Yoo Gо - Питательный коктейль Яблоко-корица (Количество в упаковке: 7 саше;)","500519"],["Yoo Go - Напиток Weight Control (яблоко-лимон) (Количество в упаковке: 14 порций по 5 г;)","500543"],["Yoo Gо - Питательный коктейль Какао-имбирь (Количество в упаковке: 7 саше;)","500541"],["CoreNRG - Жевательный мармелад с прополисом (Количество в упаковке: 90 г;)","500563"],["3D Hair & Nails Cube (Количество в упаковке: 30 пакетов по 3 таблетки;)","500571"],["Yoo Gо - Питательный коктейль Кокосовое печенье (Количество в упаковке: 7 порций по 25 г;)","500564"],["Yoo Gо - Батончик Banana Mama (вишня-банан) (Количество в упаковке: 50 г;)","500568"],["Yoo Gо - Calcium-батончик Кокос (Количество в упаковке: 50 г;)","500566"],["Yoo Gо - Turbo Tea (Очищающий турбочай) (Количество в упаковке: 30 фильтр-пакетов;)","500590"],["Baikal Tea Collection - Фиточай из диких трав № 4 (Легкое дыхание) (Количество в упаковке: 30 фильтр-пакетов;)","500584"],["3D Bone Vegan Cube (Количество в упаковке: 30 пакетов по 5 капсул;)","500572"],["Baikal Tea Collection - Фиточай из диких трав № 1 (Очищение и дренаж) (Количество в упаковке: 30 фильтр-пакетов;)","500581"],["Baikal Tea Collection - Фиточай из диких трав № 2 (Женская гармония) (Количество в упаковке: 30 фильтр-пакетов;)","500582"],["Baikal Tea Collection - Фиточай из диких трав № 3 (Природный антистресс) (Количество в упаковке: 30 фильтр-пакетов;)","500583"],["Baikal Tea Collection - Фиточай из диких трав № 5 (Комфортное пищеварение) (Количество в упаковке: 30 фильтр-пакетов;)","500585"],["Baikal Tea Collection - Фиточай из диких трав № 6 (Защита печени) (Количество в упаковке: 30 фильтр-пакетов;)","500586"],["Baikal Tea Collection - Фиточай из диких трав № 7 (Легкость движений) (Количество в упаковке: 30 фильтр-пакетов;)","500587"],["Baikal Tea Collection - Фиточай из диких трав № 8 (Сердечный комфорт) (Количество в упаковке: 30 фильтр-пакетов;)","500588"],["Baikal Tea Collection - Фиточай из диких трав № 9 (Углеводный контроль) (Количество в упаковке: 30 фильтр-пакетов;)","500589"],["Essential Vitamins - Бетаин и В-витамины (Количество в упаковке: 30 капсул;)","500625"],["Essential Vitamins - Северная клюква и В-витамины (Количество в упаковке: 30 капсул;)","500577"],["Essential Vitamins - Диосмин и рутин (Количество в упаковке: 60 таблеток;)","500626"],["Essential Sorbents - Очищающий фитосорбент Pure Life (Количество в упаковке: 80 г;)","500632"],["Essential Minerals - Органическое железо (Количество в упаковке: 60 капсул;)","500627"],["Essential Minerals - Органический кальций (Количество в упаковке: 60 капсул;)","500628"],["Essential Minerals - Органический магний (Количество в упаковке: 60 капсул;)","500629"],["Essential Minerals - Органический селен (Количество в упаковке: 60 капсул;)","500630"],["Essential Minerals - Органический цинк (Количество в упаковке: 60 капсул;)","500631"],["Siberian Super Natural Nutrition - BeautySense (Количество в упаковке: 20 пакетов по 3 капсулы;)","500650"],["Essential Sorbents - Cуставной фитосорбент Joint Comfort (Количество в упаковке: 80 г;)","500633"],["Essential Sorbents - Кишечный фитосорбент Intestinal Defense (Количество в упаковке: 80 г;)","500634"],["Essential Botanics - Арония и лютеин (Количество в упаковке: 30 капсул;)","500653"],["Essential Botanics - Гинкго билоба и байкальский шлемник (Количество в упаковке: 30 капсул;)","500654"],["Essential Botanics - Йохимбе и сибирский женьшень (Количество в упаковке: 30 капсул;)","500655"],["Essential Botanics - Медвежьи ушки и брусника (Количество в упаковке: 30 капсул;)","500656"],["Essential Botanics - Валериана и мелисса (Количество в упаковке: 30 капсул;)","500657"],["Essential Minerals - Органический йод (Количество в упаковке: 60 капсул;)","500658"],["Essential Fatty Acids - Северная омега-3 (Количество в упаковке: 60 капсул;)","500661"],["Essential Probiotics - Эльбифид (Количество в упаковке: 15 капсул;)","500663"],["Yoo Gо - Antistress-батончик (карамель и фундук) (Количество в упаковке: 25 г;)","500644"],["Essential Vitamins - Глюкозамин и хондроитин (Количество в упаковке: 60 капсул;)","500651"],["Essential Vitamins - Витамины красоты (Количество в упаковке: 30 капсул;)","500652"],["Essential Fatty Acids - Бораго и амарант (Количество в упаковке: 30 капсул;)","500659"],["Essential Vitamins - Витамины с кальцием (Количество в упаковке: 60 капсул;)","500676"],["Essential Fatty Acids - Натуральный бета-каротин и облепиха (Количество в упаковке: 30 капсул;)","500660"],["Essential Fatty Acids - Сибирский лен и омега-3 (Количество в упаковке: 30 капсул;)","500662"],["Essential Fatty Acids - Лютеин и зеаксантин (Количество в упаковке: 30 капсул;)","500688"],["Essential Fatty Acids - Ликопин и омега-3 (Количество в упаковке: 30 капсул;)","500689"],["Yoo Go - Напиток Weight Control (малина-гранат) (Количество в упаковке: 14 порций по 5 г;)","500713"],["Набор Daily Box - MAMA Box Беременность (Количество в упаковке: 30 пакетов по 2 капсулы и 2 таблетки;)","500700"],["Набор Daily Box - MAMA Box Грудное вскармливание (Количество в упаковке: 30 пакетов по 2 капсулы и 2 таблетки;)","500701"],["Essential Botanics - Ортилия и Зимолюбка (Количество в упаковке: 60 капсул;)","500864"],["Siberian Super Natural Sport - Хромлипаза (Количество в упаковке: 60 капсул;)","500874"],["Набор 4 Wellness (Набор: 2 продукта;)","500918"],["Essential Vitamins - Витамин D3 (Объем: 30 мл;)","500820"],["Чайный набор Baikal Tea Collection (Количество в упаковке: 40 фильтр-пакетов;)","500856"],["Новомин-N (Количество в упаковке: 50 капсул;)","500863"],["Essential Minerals - Органический кальций (Количество в упаковке: 60 таблеток;)","500914"],["Vitamama - Сироп для иммунитета Immunotops (Объем: 95 мл;)","500715"],["Yoo Gо - Напиток Immuno Drink (Защита иммунитета) «Лимон-имбирь» (Количество в упаковке: 8 шт. по 10 г;)","500958"],["Yoo Gо - Натуральный жевательный мармелад (апельсин) (Количество в упаковке: 90 г;)","500959"],["Сывороточный протеин Fitness Catalyst (тирамису) (Количество в упаковке: 500 г;)","500966"],["Сывороточный протеин Fitness Catalyst (ванильное мороженое) (Количество в упаковке: 500 г;)","500967"],["Yoo Gо - Натуральный жевательный мармелад (черная смородина) (Количество в упаковке: 90 г;)","500960"],["Комплекс для контроля над стрессом RELAX Box (Количество в упаковке: 30 пакетов с набором капсул;)","500931"],["Siberian Super Natural Nutrition - Detox Pro.Active (Количество в упаковке: 16 пакетов по 6 капсул;)","500943"],["Essential Minerals - Органический германий (Количество в упаковке: 30 капсул;)","500954"],["Сывороточный протеин Fitness Catalyst (черничный чизкейк) (Количество в упаковке: 500 г;)","500964"],["Сывороточный протеин Fitness Catalyst (шоколадное печенье) (Количество в упаковке: 500 г;)","500968"],["Essential Sorbents - Очищающий фитосорбент Pure Life (саше) (Количество в упаковке: 10 порций по 7,5 г;)","501001"],["Siberian Health - Зубная щетка Nano Silver","104968"],[" Aromapolis Olfactive Studio - Fresh Fig & Sparkling Tangerine, парфюмерная вода (Объем: 50 мл;)","417419"],["CoreNRG, природная профилактическая зубная паста (Объем: 75 мл;)","417379"],["Aromapolis Olfactive Studio - Dark Vanilla & Cherry Blossom, парфюмерная вода (Объем: 50 мл;)","417417"],["Набор Daily Box - GLUCO Box / Контроль уровня сахара (Количество в упаковке: 30 пакетов по 4 капсулы;)","500952"],["Vitamama - Calcitops, хрустящие шарики с какао-маслом (малина) (Количество в упаковке: 70 г;)","500670"],["Yoo Gо - Напиток Antiox Drink «Облепиха-корица» (Количество в упаковке: 8 шт. по 10 г;)","500957"],["Experalta Platinum - Мягкий гель для умывания с пробиотиками (Объем: 100 мл;)","418443"],["Experalta Platinum - Дневной крем с растительными пептидами (Объем: 50 мл;)","418445"],["Vitamama - Lactopus, хрустящие шарики с какао-маслом (шоколад) (Количество в упаковке: 70 г;)","500858"],["Fitness Catalyst - Метилсульфонилметан (Количество в упаковке: 90 капсул;)","501031"],["Новомин (Объем: 75 мл;Количество в упаковке: 120 капсул;)","501041"],["Кружка Wellness Generation (Объем: 320 мл;)","107624"],["Experalta Chronolong - Укрепляющий крем для лица (Объем: 50 мл;)","402000"],["Крафт-пакет «Волшебства в новом году» (Материал: крафт;Размер: 26х26х12 см;)","107610"],["Siberian Wellness - Биокружка «Степной орел» (Объем: 400 мл;)","107695"],["Siberian Wellness - Биокружка «Снежный Барс» (Объем: 400 мл;)","107697"],["Siberian Wellness - Биокружка «Белый медведь» (Объем: 400 мл;)","107696"],["Aromapolis Olfactive Studio - 9 Nonum, духи-концентрат (Объем: 50 мл;)","419968"],["Aromapolis Olfactive Studio - 6 Sextum, духи-концентрат (Объем: 50 мл;)","419969"],["Aromapolis Olfactive Studio - 1 Primum, духи-концентрат (Объем: 50 мл;)","419967"],["Experalta Aurum - Пробуждающая сыворотка для лица (Объем: 30 мл;)","418895"],["Experalta Platinum - Обновляющий ночной крем (Объем: 50 мл;)","418446"],["Experalta Chronolong - Сыворотка для сияния и увлажнения кожи (Объем: 60 мл;)","420057"],["Experalta Chronolong - Сыворотка, сужающая поры (Объем: 60 мл;)","420059"],["Experalta Chronolong - Крем для сужения пор и выравнивания кожи (Объем: 50 мл;)","420058"],["Косметика с комплексом ENDEMIX™ - Крем для проблемной кожи (Объем: 50 мл;)","414563"],["Experalta Biomelle - Крем для кожи вокруг глаз (Объем: 15 ml;)","419610"],["Yoo Gо - Beauty-мармелад с биотином (персик-манго) (Количество в упаковке: 90 г;)","501063"],["Experalta Biomelle - Восстанавливающий дневной крем для лица SPF 15 / PA +++ (Объем: 30 мл;)","419609"],["Fitness Catalyst - Напиток с аминокислотами (гуарана) (Количество в упаковке: 70 г (10 порций по 7 г);)","501061"],["Косметика с комплексом ENDEMIX™ - Крем-уход для волос увлажняющий (Объем: 100 мл;)","416041"],["Yoo Gо - Immuno-мармелад (тропические фрукты) (Количество в упаковке: 90 г;)","501065"],["Aromapolis Olfactive Studio - L’essence  d’Altai, духи-концентрат","411164"],["Косметика с комплексом ENDEMIX™ - Тоник для лица матирующий","414811"],["Fitness Catalyst - L-аргинин (Количество в упаковке: 120 таблеток;)","501092"],["Vitamama - Dino Lactino, какао-напиток (Количество в упаковке: 80 г;)","501101"],["Рюкзак Wellness Revolution (Количество: 1 штука;)","107631"],["Essential Nutrimix - Венотоник с диосмином и полифенолами (пряная вишня) (Количество в упаковке: 80 г (8 порций по 10 г);)","501094"],["Косметика с комплексом ENDEMIX™ - Маска для лица матирующая (Объем: 50 мл;)","420757"],["Experalta Platinum - The Body Lab, укрепляющий и моделирующий крем для тела (Объем: 230 мл;)","418447"],["Косметика с комплексом ENDEMIX™ - Маска для лица обновляющая (Объем: 50 мл;)","420759"],["Косметика с комплексом ENDEMIX™ - Маска для лица очищающая (Объем: 50 мл;)","420758"],["Experalta Chronolong - Сыворотка для повышения упругости кожи (Объем: 60 мл;)","420055"],["Vitamama - OMEGAlodon (манго), комплекс омега-3 кислот","500846"],["Vitamama - OMEGAlodon (мультифрукт), комплекс омега-3 кислот (Количество в упаковке: 60 капсул;)","500714"],["Косметика с комплексом ENDEMIX™ - Бальзам-тоник после бритья (Объем: 100 мл;)","419583"],["Хромлипаза (Количество в упаковке: 120 капсул;)","501081"],["Ритмы здоровья (Количество в упаковке: 180 капсул;)","501075"],["Косметика с комплексом ENDEMIX™ - Крем для бритья (Объем: 100 мл;)","419582"],["Хронобиологическая защита печени Синхровитал IV (Количество в упаковке: 120 капсул;)","501078"],["Experalta Platinum - Обновляющий и выравнивающий пилинг для лица (Объем: 200 мл;)","414339"],["Коллекция ароматов Ciel - Demon du Ciel, парфюмерная вода для женщин (Объем: 36 мл;)","422767"],["CIEL - Episode 21, парфюмерная вода (Объем: 50 мл;)","422773"],["Коллекция ароматов Ciel - Absolute Ego Neo, парфюмерная вода для мужчин (Объем: 95 мл;)","422770"],["Коллекция ароматов Ciel - Episode 19, парфюмерная вода (Объем: 50 мл;)","422774"],["Коллекция ароматов Ciel - Absolute Ego, парфюмерная вода для мужчин (Объем: 95 мл;)","422769"],["CIEL - Episode 15, парфюмерная вода (Объем: 50 мл;)","422911"],["Органический кальций (Количество в упаковке: 120 таблеток;)","501084"],["Гиалуроновая кислота и натуральный витамин С (Количество в упаковке: 60 капсул;)","501111"],["Коробка-сумочка Приятных подарков","107921"],["Experalta Platinum - Криолифтинговая маска для лица (Объем: 50 мл;)","418449"],["Experalta Platinum - Мицеллярная вода для снятия макияжа","418441"],["Experalta Platinum - Очищающее масло для умывания (Объем: 200 мл;)","418442"],["Experalta Platinum - Крем для повышения упругости кожи вокруг глаз (Объем: 15 ml;)","418448"],["Siberian Super Natural Nutrition ECO - Neurovision (Количество в упаковке: 20 пакетов по 3 капсулы;)","501185"],["Siberian Super Natural Nutrition ECO - Stress Re.Live (Количество в упаковке: 20 пакетов по 2 таблетки и 3 капсулы;)","501186"],["Aromapolis Olfactive Studio - L’essence de Taiga, духи-концентрат (Объем: 50 мл;)","411162"],["SIBERIAN WELLNESS - Крем для рук обновляющий Siberian Herbs (Объем: 50 мл;)","421686"],["Siberian Wellness - Крем для рук питательный Siberian Herbs (Объем: 50 мл;)","421685"],["Vitamama - Dino Lactino, пектиновый сорбент (Количество в упаковке: 70 г;)","501143"],["Experalta Aurum - Питательный крем-бальзам для лица (Объем: 50 мл;)","420862"],["Experalta Aurum - Увлажняющий крем-гель для лица","420861"],["Experalta Aurum - Увлажняющий крем для век","420863"],["Косметика с комплексом ENDEMIX™ - Шампунь для волос и тела мужской (Объем: 250 ml;)","419577"],["Yoo Gо - Питательный коктейль (апельсин-лайм) (Количество в упаковке: 7 порций по  25 г;)","501099"],["Aromapolis Olfactive Studio - Dynamique (Динамика), духи-концентрат (Объем: 50 мл;)","418434"],["Siberian Wellness - Гель для душа с экстрактом подорожника Siberian Herb (Объем: 250 ml;)","422139"],["Siberian Wellness - Крем для тела с экстрактом подорожника Siberian Herb (Объем: 250 ml;)","422140"],["Siberian Wellness - Масло массажное тонизирующее Siberian Herbs (Объем: 100 мл;)","422289"],["Коллекция ароматов Ciel - Episode 01, парфюмерная вода","422772"],["Siberian Wellness - Масло массажное расслабляющее Siberian Herbs (Объем: 100 мл;)","422287"],["Experalta Aurum - Мультиактивный крем для шеи и декольте","422395"],["Vitamama - Immunotops, фруктовые жевательные таблетки с витаминами A, C и D (Количество в упаковке: 90 таблеток;)","501072"],["Siberian Super Natural Nutrition ECO - BeautySense (Количество в упаковке: 20 пакетов по 3 капсулы;)","501187"],["Vitamama - Dino Vitamino, сироп с витаминами и минералами (Объем: 150 мл;)","500927"],["Коллекция ароматов Ciel - Arc-en-ciel №19, парфюмерная вода (Объем: 24 мл;)","422914"],["Siberian Wellness - Крем для рук увлажняющий Siberian Herbs (Объем: 50 мл;)","421684"],["Experalta Chronolong - Набор-дуэт «Для кожи, безупречной даже вблизи» (Набор: 2 продукта;)","419597"],["Women's Health - D-манноза & Северная клюква","501200"],["3D Men's Cube (Количество в упаковке: 30 пакетов по 2 капсулы и 4 таблетки;)","500951"],["Коллекция ароматов Ciel - Demi-Lune № 04, парфюмерная вода для мужчин (Объем: 90 мл;)","422771"],["Цитрусовое драже с витаминами «Лопутоп» (Количество в упаковке: 72 г (120 штук по 0,6 г);)","501223"],["CoreNRG, антиоксидантный бустер (Объем: 30 мл;)","501139"],["Косметика с комплексом ENDEMIX™ - Солнцезащитный крем для тела SPF 30 (Объем: 100 мл;)","423886"],["Косметика с комплексом ENDEMIX™ - Солнцезащитный крем для лица SPF 50 (Объем: 50 мл;)","423888"],["Experalta Platinum - Восстанавливающая эссенция с ниацинамидом 10%","418451"],["Fitness Catalyst - Пептиды морского коллагена Fitness Catalyst (оригинал) (Количество в упаковке: 200 г;)","501152"],["Fitness Catalyst - Таурин (Количество в упаковке: 60 капсул;)","501217"],["Косметика с комплексом ENDEMIX™ - Пенка для умывания увлажняющая (Объем: 150 мл;)","422377"],["Косметика с комплексом ENDEMIX™ - Гель для умывания с омега-кислотами (Количество в упаковке: 200 г;Объем: 200 мл;)","422644"],["Siberian Wellness - GREEN-мыло для кухни Siberian Herbs (Объем: 400 мл;)","422647"],["Косметика с комплексом ENDEMIX™ - Крем для лица с омега-кислотами и бета-каротином (Объем: 50 мл;)","422645"],["Yoo Gо - Veggie, питательный коктейль (кофе-шоколад) (Количество в упаковке: 500 г;)","501336"],["Yoo Gо - Veggie, питательный коктейль (апельсин-лайм) (Количество в упаковке: 500 г;)","501337"],["Fitness Catalyst - Энергетический бустер (Объем: 30 мл;)","501183"],["Yoo Gо - Veggie, питательный коктейль (персик-апельсин) (Количество в упаковке: 500 г;)","501338"],["Essential Vitamins - Витамин С и рутин (Количество в упаковке: 60 капсул;)","501233"],["Косметика с комплексом ENDEMIX™ - Сыворотка для роста волос (Объем: 100 мл;)","422364"],["Essential Vitamins - Альфа-липоевая кислота (Количество в упаковке: 60 капсул;)","501236"],["Fitness Catalyst - Пептиды морского коллагена (ваниль-черника) (Количество в упаковке: 200 г;)","501181"],["Siberian Wellness - Крем для ног увлажняющий с прополисом Siberian Herbs (Объем: 75 мл;)","422292"],["Essential Amino Acids - Глицин (Количество в упаковке: 60 капсул;)","501237"],["Vitamama - Dino Vision, жевательные таблетки с черникой (Количество в упаковке: 90 таблеток;)","501182"],["Siberian Wellness - Масло массажное согревающее Siberian Herbs (Объем: 100 мл;)","422288"],["Experalta Platinum - Омолаживающий тоник-софтнер (Объем: 200 мл;Объем: 200 мл;)","418450"],["Косметика с комплексом ENDEMIX™ - Гель для деликатного ухода (Объем: 20 ml;)","423400"],["Siberian Wellness - Скраб для тела с кедром с ягодами Siberian Herbs","423113"],["Women's Health - Age Тhеrару Antioxidants (Количество в упаковке: 30 капсул;)","501251"],["Косметика с комплексом ENDEMIX™ - Дезодорант для тела мужской (Объем: 60 мл;)","423958"],["Косметика с комплексом ENDEMIX™ - Дезодорант для тела женский (Объем: 60 мл;)","423959"],["Women's Health - Хелат железа (Количество в упаковке: 60 капсул;)","501290"],["Essential Botanics - Биодоступный куркумин (Количество в упаковке: 30 капсул;)","501141"],["Vitamama - Immunotops, хрустящие шарики с инулином (вишня) (Количество в упаковке: 70 г;)","501329"],["Essential Vitamins - Vitamin К2 (Количество в упаковке: 30 капсул;)","501234"],["Experalta Aurum - Восстанавливающий тонер с церамидами (Объем: 200 мл;)","422447"],["Experalta Aurum - Тонер для сияния кожи с AHA- & PHA-кислотами (Объем: 200 мл;)","422394"],["Essential Botanics - Перуанская мака (Количество в упаковке: 60 капсул;)","501306"],["Women's Health - Хронолонг (Количество в упаковке: 30 капсул;)","501330"],["Косметика с комплексом ENDEMIX™ - Крем для век с омега-кислотами и бета-каротином (Объем: 15 ml;)","422646"],["Experalta Platinum - Увлажняющий тонирующий крем SPF 15 (слоновая кость) (Объем: 30 мл;)","424161"],["Yoo Gо - Energy, драже с мультивитаминами (черника) (Количество в упаковке: 70 г;)","501305"],["Yoo Gо - MetaBio-мармелад (кактус-инжир) (Количество в упаковке: 90 г;)","501335"],["Experalta Aurum - Выравнивающая ночная крем-маска (Объем: 50 мл;)","422448"],["Косметика с комплексом ENDEMIX™ - Пилинг для кожи головы (Объем: 100 мл;)","424380"],["Essential Botanics - Растительный мелатонин (Количество в упаковке: 60 капсул;)","501232"],["Experalta Platinum - Полирующий эксфолиант для лица (Объем: 50 мл;)","418444"],["Siberian Wellness - Крем для рук питательный (Объем: 50 мл;)","424684"],["Siberian Wellness - Гель для душа Цитрус & Пихта (Объем: 250 ml;)","424687"],["Siberian Wellness - Скраб для тела Какао & Цитрус","424689"],["Siberian Wellness - Крем для рук S.O.S Восстановление (Объем: 50 мл;)","424686"],["Зубные пасты - Набор «Ягодный микс» (Набор: 2 продукта;)","425679"],["Siberian Wellness - Крем для рук смягчающий (Объем: 50 мл;)","424685"],["Fitness Catalyst - Набор «Мужская энергия» (Количество: 2 штуки;)","501363"],["Women's Health - Набор «Вселенная красоты» (Количество: 2 штуки;)","501375"],["Набор «Иммунитет и восстановление» (Количество: 2 штуки;)","501379"]]`); 
        // let codes = JSON.parse(sheConfig.productsCodesJSON);
  			for (let row of codes) {
  				if (pool.includes(row[1])) continue;
  				pool.push(row[1]);
  				datalist += `<option value="${row[1]}">${row[0]}</option>`
  			}
  			pool = null;
  			datalist += '</datalist>';
  			let codeInput = vfyEl('#code');
  			codeInput.insertAdjacentHTML('afterend', datalist);
  			codeInput.setAttribute('list', 'sheCodesDatalist');
  			codeInput.setAttribute('placeholder', 'Название');
  			codes = null;
  		},
  	},
  	editButtonForNewCreate: {
  		init() {
  			var delBoxCh3 = vfyEl('#delBox > div:nth-child(3)');
  			var factura_Td = vfyEl('#delBox > div:nth-child(1) > table > tbody > tr > td:nth-child(1)');
  			delBoxCh3.insertAdjacentHTML('afterbegin', `
  				<form class="edForm" method="post" action="/ru/store/header/new/edit/">
	                <input type="hidden" name="factura_id" value=${factura_Td.innerText}>
	                <input type="submit" id="edit" class="btn" value="Перейти к редактированию фактуры">
            	</form>
  			`)
  		},
  	},
  	moreInfoAboutCustomer: {
  		init() {
  			var submit = document.getElementById('submit');
  			var inputFrom = document.querySelector('input[name=fromContract');

  			vfy(submit instanceof HTMLElement, 'Submit-element was not found');
  			vfy(inputFrom instanceof HTMLElement, 'InputFrom-element was not found');
  			submit.insertAdjacentHTML('afterend', '<button '+sheConfig.style+' id="moreCustomerInfoButton" type="submit" style="margin: 5px !important;">Подробно</button><br><div id="moreCustomerInfoDiv"></div')
  			moreCustomerInfoButton.addEventListener('click', (e) => {
  			    e.preventDefault();
    				vfy(inputFrom.value.length > 4, 'Выберите покупателя!'); 
  			    this.getInfoAboutCustomer.call(
  			    	this, 
  			    	inputFrom.value
  			    ).then(p => p.json().then( r => moreCustomerInfoDiv.innerHTML = this.rToHTML.call(this, r)) );
  			});
  			return this;
  		},
  		getInfoAboutCustomer(contract) {
		    return fetch("https://kz.siberianhealth.com/ru/store/header/new/info_customer/", {
		      "headers": {
		        "accept": "application/json, text/javascript, */*; q=0.01",
		        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
		        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		        "ml-contract": "M11123",
		        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
		        "sec-ch-ua-mobile": "?0",
		        "sec-ch-ua-platform": "\"Windows\"",
		        "sec-fetch-dest": "empty",
		        "sec-fetch-mode": "cors",
		        "sec-fetch-site": "same-origin",
		        "x-requested-with": "XMLHttpRequest"
		      },
		      "referrer": "https://kz.siberianhealth.com/ru/store/header/new/",
		      "referrerPolicy": "strict-origin-when-cross-origin",
		      "body": `contract=${contract}`,
		      "method": "POST",
		      "mode": "cors",
		      "credentials": "include"
		    });
		  },
    	rToHTML(r) {
  	    let d = r.data;
  	    console.log(d);
  	    let t = {
  	        true: 'да',
  	        false: 'нет',
  	        null: 'неизвестно',
  	        undefined: 'неизвестно',
  	    };
  	    let rank;
  	    if (typeof d.Rank === 'object' && d.Rank !== null) {
  	        rank = d.Rank.nameShort || d.Rank.name;
  	    }
  	    else {
  	        rank = t.null;
  	    }
  	    return `
  	        <br><span>Номер магазина: ${t[d.storeContract] || d.storeContract}</span><br>
  	        <span>День рождения: ${t[d.birthday] || d.birthday}</span><br>
  	        <span>Дата регистрации: ${t[d.dtRegister] || d.dtRegister.split('T')[0]}</span><br>
  	        <span>E-mail подтвержден: ${t[d.isEmailVerified]}</span><br>
  	        <span>Телефон подтвержден: ${t[d.isPhoneVerified]}</span><br>
  	        <span>Телефон: ${t[d.phoneRaw] || d.phoneRaw}</span><br>
  	        <span>Ранг: ${rank}</span><br>
  	        <span>Адрес: ${t[d.address] || d.address}</span><br>
  	    `
    		}
  	},
  	factureToOrder: {
  		init() {
  			this.productTabs = document.querySelector('#productTabs');
  			vfy(this.productTabs !== null);
			this.productTabs.insertAdjacentHTML(
	          "beforeend",
	          '<textarea ' + 
	            sheConfig.style +
	            'placeholder="Нажмите на поле и Ctrl+Delete" ' + 
	            'style="margin-left: 90px;" ' + 
	            'rows="5" ' + 
	            'cols="30" ' + 
	            'id="textareaFactureToOrder">' +
	          '</textarea>'
	        );
	        this.textareaFactureToOrder = document.querySelector('#textareaFactureToOrder');
	        this.textareaFactureToOrder.addEventListener('keydown', this.convert.bind(this));
  		},
  		convert(e) {
  			this.itemRows = document.querySelectorAll('.itemRow');
  			this.facturaItemsTrs = [...document.querySelectorAll('#facturaItems tr')];
  			vfy(this.facturaItemsTrs.length > 6);
  			this.finalTr = this.facturaItemsTrs[this.facturaItemsTrs.length-3];
  			vfy(this.finalTr.innerText.includes('Итог'));
  			if (e.key === 'Delete' && !e.repeat && e.ctrlKey) {
        		var res = 'Код\tПродукт\tКоличество\tБаллы\tЦена\n';
        		for (var row of this.itemRows) {
        			let tds = row.children;
        			res += tds[1].innerText + '\t' +
        				tds[2].innerText + '\t' +
        				tds[3].children[0].value + '\t' +
        				tds[4].innerText + '\t' +
        				tds[5].innerText + '\n';
        		}
        		let finch = this.finalTr.children;
        		res += 'Итог:\t\t' +  
        			finch[3].innerText + '\t' + 
        			finch[4].innerText + '\t' + 
        			finch[6].innerText.replace(' (KZT)', '');
        		this.textareaFactureToOrder.value = res;
        	}
  		},
  	},
    formatProduct: {
      init() {
        l('SHE: formatProduct initializing...')
        var blockList = document.querySelector("#blockList");

        vfy(
          blockList !== null, 
          'Expected that document.querySelector("#blockList") is not null.',
        );

        blockList.insertAdjacentHTML(
          "beforebegin",
          '<input ' +
            sheConfig.style +
            'id="formatProductInput" ' +
            'type="submit" ' + 
            'value="Получить форматный продукт" ' +
          '>'
        );
        l('SHE: formatProductInput was placed.')
        var formatProductInput = document.querySelector("#formatProductInput");

        formatProductInput.addEventListener("click", () => {
          l("formatProduct starts formatting...")
          fetch("https://kz.siberianhealth.com/ru/store/header/order/showcase/search/", {
            "headers": {
              "accept": "application/json, text/javascript, */*; q=0.01",
              "accept-language": "ru,en-US;q=0.9,en;q=0.8,bg;q=0.7",
              "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
              "ml-contract": "M11123",
              "sec-ch-ua": "\"Not_A Brand\";v=\"99\", \"Google Chrome\";v=\"109\", \"Chromium\";v=\"109\"",
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": "\"Windows\"",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest"
            },
            "referrer": "https://kz.siberianhealth.com/ru/store/header/order/showcase/new/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "searchType=category&category=0&name=&code=&days=0&cartId=" + this.getCartId(),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
          }).then(p => p.text().then(t => {
            blockList.insertAdjacentHTML(
              "beforebegin", 
              "<textarea " + sheConfig.style + ">" + t + "</textarea>"
            );
          }));

        });
        l('SHE: formatProductInput initialized.')
        return this;
      },
      getCartId() {
        var match = document.body.innerHTML.match(/cart: {"id":(\d+),/);
        return match[1];
      }
    },
    orderBackup: {
      init() {
        l('SHE: orderBackup initializing...');
        this.sale = 0.9;
        
        var blockFilter = document.querySelector("#blockFilter");
        
        vfy(
          blockFilter !== null, 
          'Expected that document.querySelector("#blockFilter") is not null.'
        );

        blockFilter.insertAdjacentHTML(
            "beforeend",
            '<textarea ' +
              sheConfig.textareaCols +
              sheConfig.style +
              'id="textareaOrderBackup" ' +
              'placeholder="Ctrl+Delete для копирования внесенного заказа">'+
            '</textarea>'
        );
        l('SHE: textareaOrderBackup was placed.')
        this.textareaOrderBackup = document.querySelector("#textareaOrderBackup");
        this.textareaOrderBackup.addEventListener(
          "keydown",
          (function (e) {
            if (e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              l('SHE: backupOrder starting.')
              this.backupOrder.call(this);
            }
          }).bind(this)
        );
        l('SHE: orderBackup initialized.');
        return this; 
      },
      backupOrder() {
        var trs = document.querySelectorAll(".product-row:not(.absent)");

        vfy(
          trs !== null,
          'Expected that document.querySelectorAll(".product-row:not(.absent)") is not null.'
        );

        var result = "";
        for (var tr of trs) {
          var value = tr.querySelector(".order_count").value; 
          if (value === '' || value === '0') continue;
          result += tr.children[2].innerText + "\t" +
            tr.children[3].innerText + "\t" + 
            value + "\t" + 
            tr.children[6].innerText + "\t" +
            +(tr.children[7].innerText)*this.sale + "\n";
            l('SHE: forming backup result', {result})
        }      
        this.textareaOrderBackup.value = result;
      }
    },
    orderCleaning: {
      init() {
        l('SHE: orderCleaning initializing...')
        var blockList = document.querySelector("#blockList");

        vfy(
          blockList !== null, 
          'Expected that document.querySelector("#blockList") is not null'
        );

        blockList.insertAdjacentHTML(
          "beforebegin",
          '<input ' +
            sheConfig.style +
            'id="cleanOrderInput" ' +
            'type="submit" ' + 
            'value="Очистить заказ" ' +
          '>'
        );
        l('SHE: cleanOrderInput was placed.');
        var cleanOrderInput = document.querySelector("#cleanOrderInput");

        cleanOrderInput.addEventListener(
          "click",
          (function () {
            l('SHE: cleanOrderInput clicked.');
            var isOkToClean = confirm(
              "Все введеные количества будут очищены. Продолжить?"
            );
            
            if (!isOkToClean) {
              alert("Очистка отменена.");
              return;
            };

            this.cleanOrder.call(this);
          }).bind(this)
        );
        return this;
        l('SHE: cleanOrder initialized.')
      },
      cleanOrder() {
        var trs = document.querySelectorAll(".product-row:not(.absent)");
        vfy(
          trs !== null,
          'Expected that document.querySelectorAll(".product-row:not(.absent)") is not null.'
        );
        for (var tr of trs) {
          var inputs = tr?.children[13]?.children?.[0]?.children;
          vfy(
            inputs !== undefined,
            'Expected: tr?.children[13]?.children?.[0]?.children is not undefined.'
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
        l('SHE: autoOrder initializing...');
        var settings = {
          code_column: 0,
          amount_column: 2,
        };
        Object.assign(this, settings);

        var blockFilter = document.querySelector("#blockFilter");
        
        vfy(
          blockFilter !== null, 
          'Expected: document.querySelector("#blockFilter") is not null.'
        );

        blockFilter.insertAdjacentHTML(
            "beforeend",
            '<textarea ' +
            sheConfig.style +
            sheConfig.textareaCols +
            'id="textareaAutoOrder" ' +
            'placeholder="Вставьте таблицу с заказом и нажмите Ctrl+Delete">' +
            '</textarea>'
        );

        l('SHE: textareaAutoOrder was placed.')
        this.textareaAutoOrder = document.querySelector("#textareaAutoOrder");
        this.textareaAutoOrder.addEventListener(
          "keydown",
          (function (e) {
            if (e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              l('SHE: shOutputToOrder started.');
              this.shOutputToOrder.call(
                this, 
                this.textareaAutoOrder.value,
                blockList
              )
            }
          }).bind(this)
        );
        l('SHE: autoOrder initialized.');
        return this;
      },
      shOutputToOrder(shOutput, blockList) {
        if(!shOutput) return;
        var order = {};
        for (var line of shOutput.split("\n")) {
          var splitted = line.split("\t");

          if ( ["Код", "Итог:"].includes(splitted[0]) ) continue; 

          order[splitted[this.code_column]] = {am: splitted[this.amount_column], name: splitted[1]};
        }
        l('SHE: shOutput converted to order-object.')
        var trs = blockList.querySelectorAll("tr");

        vfy(
          trs !== null, 
          'Expected: blockList.querySelectorAll("tr") is not null.'
        );

        for (var tr of trs) {
          var code = tr.children[2]?.innerText;
          if (order[code] && +order[code].am > 0) {
            var btn_more = tr.querySelectorAll("button")[1];
            vfy(
              btn_more !== null, 
              'Expected: tr.querySelectorAll("button")[1] is not null.'
              );
            for (var i = 0; i < +order[code].am; i++) {

              btn_more.dispatchEvent(
                new Event("click", { bubbles: true })
              )
            }
            l(code + ' added.')
            delete order[code];
          }
        }
        var notAdded = '';
        for (var code in order) {
          if (isFinite(order[code].am) && +order[code].am > 0) {
            notAdded += "" + order[code].name + ' --- ' + order[code].am + '\n\n';
          }
        }
        alert("Заказ сформирован. Из заказа не были добавлены:\n\n" + notAdded);
        this.textareaAutoOrder.value = "Заказ сформирован. Из заказа не были добавлены:\n\n" + notAdded;

      }
    },
    autoFacture: {
      init() {
        l('SHE: autoFacture initializing...');
        this.prepare.call(this);
        this._manageOrderTextareaCreating.call(this);
        l('SHE: autoFacture initialized.');
        return this;
      },
      prepare() {
        this.skipped = [];
        var d = document;
        var nodes = {
          productTabs: d.querySelector("#productTabs"), 
          codeInput: d.querySelector("#code"),
          nameInput: d.querySelector("#name"),
          productSearch: d.querySelector("#productSearch"),
          prodList: d.querySelector("#prodList"),
        };

        vfy(
            nodes.productTabs !== null &&
            nodes.codeInput !== null &&
            nodes.nameInput !== null &&
            nodes.productSearch !== null &&
            nodes.prodList !== null, 
          `Expected: 
          document.querySelector("#productTabs"), 
          document.querySelector("#code"), 
          document.querySelector("#name"),
          document.querySelector("#productSearch"), 
          document.querySelector("#prodList")
          are not null.
          `
        );

        var settings = {
          interval_time_ms: 1000,
          code_column: 0,
          amount_column: 2,
        };

        var intranet = d.querySelector("#intranet a");

        vfy(
          intranet !== null,
          'Expected: document.querySelector("#intranet a") is not null.'
        );

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

        l('SHE: textareaOrder was placed.');
        this.textareaOrder = document.querySelector("#textareaOrder");

        this.textareaOrder.addEventListener(
          "keydown",
          (function (e) {
            if(e.ctrlKey && e.key === "Delete" && !(e.repeat) ) {
              l('SHE: textareaOrder event handling started.');
              this._handleOrderTextareaEvent.call(this);
            }
          }).bind(this)
        );
      },
      async _handleOrderTextareaEvent() {
        var factureDataElement = document.querySelectorAll(
            "#delBox div table tbody tr td"
        );

        vfy(
          factureDataElement !== null, 
          'Expected: document.querySelectorAll("#delBox div table tbody tr td") is not null.'
        );

        this.query_order = {
          positions: [],
          factureId: factureDataElement[0]?.innerText
        };

        this.textareaOrder.disabled = true;
        this._prepareOrderObject.call(this);

        async function* generator() {
          for (var index = 0; index < this.order.length; index++) {
            await this._handleOrderLine.call(this, this.order[index]);
            this.textareaOrder.value = "Прогресс: " + (index+1) + "/" + this.order.length;
            yield index;
          }
        }
        
        for await (var value of generator.call(this)) {}

        this._turnQueryOrderToQueryConfig.call(this);

        var promise = await fetch("/ru/store/header/new/addproducts/", this.query_config);
        var promise_text = await promise.text();

        this.textareaOrder.value = this._skippedToTextarea.call(this);

        alert(this.textareaOrder.value);

      },
      _skippedToTextarea() {
        var string = "Пропущенные позиции:\n\n";
        for (var line of this.skipped) {
          string += line[1] + " --- " + line[2] + '\n\n';
        }
        return string;
      },
      _turnQueryOrderToQueryConfig() {
        var body = "factura_id=" + this.query_order.factureId;
        for (var line of this.query_order.positions) {
          body += "&" + line.name + "=" + line.amount;
        }
        this.query_config["body"] = body;
      },
      _prepareOrderObject() {
        this.order = [];
        for ( var raw_line of this.textareaOrder.value.split("\n") ) {
          var line = raw_line.split("\t");
          if (line[0] === "Код" || line[0] === "Итог:") continue;
          this.order.push(line);
        }
      },
      async _handleOrderLine(line) {
        this.codeInput.value = line[this.code_column];
        if (this.prodList.style.display !== "none") {
          this.prodList.style.display = "none";
        }
        this.productSearch.dispatchEvent(new Event("click"))

        await new Promise( (function (resolve) {
          var interval = setInterval( (function () {
            if (this.prodList.style.display !== "none") {
              clearInterval(interval)
              resolve()
            }
          }).bind(this), this.interval_time_ms)
        }).bind(this));
        this._handleProductAddingToQueryOrder.call(this, line);
      },
      _handleProductAddingToQueryOrder(line) {
        var amount_inputs = document.querySelectorAll("#productForm table input");
        vfy(
          amount_inputs !== null,
          'Expected: document.querySelectorAll("#productForm table input") is not null.'
        );
        var remain_td = document.querySelectorAll("#productForm tbody tr td");
        vfy(
          remain_td !== null,
          'Expected: document.querySelectorAll("#productForm tbody tr td") is not null.'
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
        var input = document.querySelectorAll("#productForm table input");
        vfy(
          input !== null,
            'Expected: document.querySelectorAll("#productForm table input") is not null.'          
        );  
        this.query_order.positions.push({
          name: input[0].name,
          amount: line[this.amount_column],
        });
      }
    },
    allFactureItemsCheckbox: {
      init() {
        this.cookCheckbox.call(this);
        return this;
      },
      cookCheckbox(event=false) {
        var facturaStruct = document.querySelector("#facturaStruct");
        vfy(
          facturaStruct !== null,
          'Expected: document.querySelector("#itemsForm td")'
        );
        facturaStruct.insertAdjacentHTML(
          'afterbegin',
          '<input id="sheItemsCheckAll" type="checkbox"> Отметить все позиции<br>'
        );
        var itemsCheckAll = document.querySelector("#sheItemsCheckAll");
        vfy(
          itemsCheckAll !== null,
          'Expected: document.querySelector("#sheItemsCheckAll") !== null'
        );
        itemsCheckAll.addEventListener('click', function (event) {
          event.stopPropagation();
          var itemChecks = document.querySelectorAll(".itemCheck");
          vfy(
            itemChecks !== null,
            'Expected: document.querySelectorAll(".itemCheck") !== null'
          );
          if (itemsCheckAll.checked) {
            for (var itemCheck of itemChecks) {
              itemCheck.checked = true;
            }
            return;
          }
          for (var itemCheck of itemChecks) {
            itemCheck.checked = false;
          }
        });
      }
    },
  }
};
(async function () {
  try {
    await sheContent.init();
  }
  catch(er) {
    alert(er);
    console.error(er.stack);
  }
}) ();

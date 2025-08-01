// ==UserScript==
// @name         Sibz-Helper Pantry Catalog Updater
// @namespace    http://tampermonkey.net/
// @version      2025-07-21
// @description  sibz-helper extension
// @author       a
// @match        https://store.siberianhealth.com/kz-ru/*
// @match        https://ru.siberianhealth.com/ru/store/header/order/showcase/new/
// @match        https://kz.siberianhealth.com/ru/store/header/order/showcase/new/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

var l = console.log;
var qw = console.log;
const encryptedPantryKey = 'cGO7MegatLOr30spw2rz4XO2OgEkOQqwRqR8ae/+TXWhlD83HUP5sRB4S5j4gy5TQw3v8Riet41NCo2zwKZxSLDAyYyUqMkob52rZRoTFMw=';
const OriginalXMLHttpRequest = window.XMLHttpRequest;
class XMLHttpRequestProxy {
    constructor() {
        this.xhr = new OriginalXMLHttpRequest();
        this.method = null;
        this.url = null;
        this.headers = {};
        this.requestBody = null;
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        const events = [
            'loadstart', 'load', 'loadend', 'progress',
            'error', 'abort', 'timeout', 'readystatechange'
        ];

        events.forEach(event => {
            this.xhr.addEventListener(event, (e) => {
                if (this[`on${event}`]) {
                    this[`on${event}`](e);
                }
            });
        });
    }
    open(method, url, async = true, user = null, password = null) {
        this.method = method;
        this.url = url;
        qw('xhr open')
        return this.xhr.open(method, url, async, user, password);
    }
    send(body = null) {
        this.requestBody = body;
        return this.xhr.send(body);
    }
    setRequestHeader(name, value) {
        this.headers[name] = value;
        return this.xhr.setRequestHeader(name, value);
    }
    getResponseHeader(name) {
        const value = this.xhr.getResponseHeader(name);
        return value;
    }
    getAllResponseHeaders() {
        const headers = this.xhr.getAllResponseHeaders();
        return headers;
    }
    abort() {
        return this.xhr.abort();
    }
    modifyUrl(url) {
        // Пример: добавление параметров к URL
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}proxy=true`;
    }
    modifyRequestBody(body) {
        // Пример: модификация JSON-данных
        if (typeof body === 'string') {
            try {
                const data = JSON.parse(body);
                data.proxied = true;
                return JSON.stringify(data);
            } catch (e) {
                return body;
            }
        }
        return body;
    }
    get readyState() {
        return this.xhr.readyState;
    }
    get response() {
        const response = this.xhr.response;
        return response;
    }
    get responseText() {
        const responseText = this.xhr.responseText;
        return responseText;
    }
    get responseXML() {
        return this.xhr.responseXML;
    }
    get status() {
        return this.xhr.status;
    }
    get statusText() {
        return this.xhr.statusText;
    }
    get responseURL() {
        return this.xhr.responseURL;
    }
    get timeout() {
        return this.xhr.timeout;
    }
    set timeout(value) {
        this.xhr.timeout = value;
    }
    get withCredentials() {
        return this.xhr.withCredentials;
    }
    set withCredentials(value) {
        this.xhr.withCredentials = value;
    }
    get responseType() {
        return this.xhr.responseType;
    }
    set responseType(value) {
        this.xhr.responseType = value;
    }
    get upload() {
        return this.xhr.upload;
    }
    set onreadystatechange(handler) {
        this.xhr.onreadystatechange = handler;
    }
    get onreadystatechange() {
        return this.xhr.onreadystatechange;
    }
    set onload(handler) {
       if (typeof handler === 'function') {
        this.xhr.onload = ((e) => {
          const isFullCatalogRequest = (
              this.url.includes('order/showcase/search') &&
              this.requestBody.includes('category=0')
          );
          if (isFullCatalogRequest) {
            const sendToPantry = confirm('Получен актуальный каталог продуктов. Обновить его на сайте?');
            if (!sendToPantry) return;
            qw(this)
            const password = sheContent.scripts.pantryCatalogUpdater.handlePassword();
            const catalog = sheContent.scripts.pantryCatalogUpdater.cookPantryCatalog(this.responseText);
            sheContent.scripts.pantryCatalogUpdater.sendCatalog(catalog, password);
          }
          handler(e);
        }).bind(this);
        return;
       }
       this.xhr.onload = handler;
    }
    get onload() {
        return this.xhr.onload;
    }
    set onerror(handler) {
        this.xhr.onerror = handler;
    }
    get onerror() {
        return this.xhr.onerror;
    }
    set onabort(handler) {
        this.xhr.onabort = handler;
    }
    get onabort() {
        return this.xhr.onabort;
    }
    set ontimeout(handler) {
        this.xhr.ontimeout = handler;
    }
    get ontimeout() {
        return this.xhr.ontimeout;
    }
    set onloadstart(handler) {
        this.xhr.onloadstart = handler;
    }
    get onloadstart() {
        return this.xhr.onloadstart;
    }
    set onloadend(handler) {
        qw('she handler end', typeof handler, handler)
        this.xhr.onloadend = handler;
    }
    get onloadend() {
        return this.xhr.onloadend;
    }
    set onprogress(handler) {
        this.xhr.onprogress = handler;
    }
    get onprogress() {
        return this.xhr.onprogress;
    }
    addEventListener(type, listener, options) {
        return this.xhr.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
        return this.xhr.removeEventListener(type, listener, options);
    }
    dispatchEvent(event) {
        return this.xhr.dispatchEvent(event);
    }
}

class SecureEncryption {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12; // 96 бит для GCM
        this.saltLength = 16; // 128 бит
        this.iterations = 100000; // PBKDF2 итерации
    }

    // Генерация криптографического ключа из пароля
    async deriveKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.algorithm,
                length: this.keyLength
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Шифрование
    async encrypt(plaintext, password) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(plaintext);

            // Генерация случайной соли и IV
            const salt = crypto.getRandomValues(new Uint8Array(this.saltLength));
            const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));

            // Создание ключа
            const key = await this.deriveKey(password, salt);

            // Шифрование
            const encrypted = await crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                data
            );

            // Объединение соли, IV и зашифрованных данных
            const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
            result.set(salt, 0);
            result.set(iv, salt.length);
            result.set(new Uint8Array(encrypted), salt.length + iv.length);

            // Кодирование в Base64
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            throw new Error('Ошибка шифрования: ' + error.message);
        }
    }

    // Расшифровка
    async decrypt(encryptedData, password) {
        try {
            // Декодирование из Base64
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));

            // Извлечение соли, IV и зашифрованных данных
            const salt = data.slice(0, this.saltLength);
            const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
            const encrypted = data.slice(this.saltLength + this.ivLength);

            // Создание ключа
            const key = await this.deriveKey(password, salt);

            // Расшифровка
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv
                },
                key,
                encrypted
            );

            // Декодирование в текст
            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            throw new Error('Ошибка расшифровки: неверный пароль или повреждённые данные');
        }
    }
}
var cipher = new SecureEncryption;
var pcuContent = {
  init() {
    l('PCU: pcuContent initializing...');
    this.pathnames = {
      order: "/header/order/showcase/new/",
    };
    this.choice = {};
    l("PCU: Scripts' choosing...");
    this.chooseScript.call(this, document.location.pathname);
    l('PCU: pcuContent initialized.')
    return this;
  },
  chooseScript(pathname) {
    if (pathname.includes(this.pathnames.order)) {
      this.choice.pantryCatalogUpdater = this.scripts.pantryCatalogUpdater.init();
    }
  },
  scripts: {
    pantryCatalogUpdater: {
      init() {
        l('PCU: panrtyCatalogUpdater initializing...');
        unsafeWindow.XMLHttpRequest = XMLHttpRequestProxy;
        l('PCU: panrtyCatalogUpdater initialized');
      },
      handlePassword() {
        var password = localStorage.getItem('pcuEncPassword');
        if (!password) {
          password = prompt('Пароль шифрования Sibz-Helper');
          localStorage.setItem('pcuEncPassword', password);
        }
        return password;
      },
      cookPantryCatalog(rawCatalog) {
        const obj = JSON.parse(rawCatalog);
        let converted = ``;
        for (let position of obj) {
          // if (position.balance < 1) {
          //   continue;
          // }
          converted += (
            ("" + position.product.code).replace("\t", "") + "\t" +
            ("" + position.product.name).replace("\t", "").replace("`", "") + "\t" +
            ("" + position.point).replace("\t", "") + "\t" +
            ("" + position.price).replace("\t", "") + "\t" +
            ("" + position.balance).replace("\t", "") + "\t" +
            ("" + position.product.discountFactor).replace("\t", "") + "!@#"
          );
          converted = converted.replaceAll('"', "$%^");
        }
        return converted;
      },
      async sendCatalog(catalog, password) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
          timestamp: Date.now(),
          products: catalog
        });

        var requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        const pantryKey = await cipher.decrypt(encryptedPantryKey, password);
        fetch(`https://getpantry.cloud/apiv1/pantry/${pantryKey}/basket/sh`, requestOptions)
          .then(response => {
            if (response.ok) {
              alert('Каталог обновлен');
            } else {
              alert('ОШИБКА. Не удалось обновить каталог: ' + response.status);
            }
          })
      }
    },
  }
};
(async function () {
  try {
    await pcuContent.init();
  }
  catch(er) {
    alert(er);
    console.error(er.stack);
  }
}) ();

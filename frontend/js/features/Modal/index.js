// TODO Добавить обработчик нажатий на Таб.
(function() {
  'use strict';

  const COMPONENTS_CN = {
    BLOCK: 'modal',
    BLOCK_ACTIVE: 'modal_active',
    INNER: 'modal__inner',
    CLOSER: 'modal__closer',
    FW_CLOSER: 'modal__fw-closer',
    EXTRA_CLOSER: 'modal__extra-closer',
    POPUP: 'modal__popup',
    CONTENT: 'modal__content',
    CONTENT_BUTTONS: 'modal__content-buttons',
  };

  const ATTRIBUTES = {
    // TODO Задокументировать аттрибуты `CONTINUE` и `CLOSER` (`readme/MODAL.md`).
    CONTINUE: 'data-modal-continue',
    CALLER: 'data-modal-caller',
    CLOSER: 'data-modal-closer',
    CLONE_FROM: 'data-modal-clone-from',
    ALERT: 'data-modal-alert',
    CONFIRM: 'data-modal-confirm',
    CONFIRM_CB: 'data-modal-confirm-cb',
    CONFIRM_PARAMS: 'data-modal-confirm-param',
  };

  const HTML_IDS = {
    AUTO: 'modal-auto-',
    ALERT: 'modal-alert',
    CONFIRM: 'modal-confirm',
    CONFIRM_OK: 'modal-confirm-ok',
  };

  const TEMPLATES = {
    INNER: `
      <div class="${COMPONENTS_CN.INNER}">
        <button class="${COMPONENTS_CN.FW_CLOSER}" tabindex="-1"></button>
        <div class="${COMPONENTS_CN.POPUP}">
          <button class="${COMPONENTS_CN.CLOSER}" tabindex="0"></button>
          <div class="${COMPONENTS_CN.CONTENT}">$content</div>
        </div>
      </div>
    `,

    INNER_WO_CLOSERS: `
      <div class="${COMPONENTS_CN.INNER}">
        <div class="${COMPONENTS_CN.POPUP}">
          <div class="${COMPONENTS_CN.CONTENT}">$content</div>
        </div>
      </div>
    `,

    ALERT: `
      <div class="${COMPONENTS_CN.INNER}">
        <button class="${COMPONENTS_CN.FW_CLOSER}" tabindex="-1"></button>
        <div class="${COMPONENTS_CN.POPUP}">
          <button class="${COMPONENTS_CN.CLOSER}" tabindex="0"></button>
          <div class="${COMPONENTS_CN.CONTENT}">$content</div>
          <div class="mt-2 text-center ${COMPONENTS_CN.CONTENT_BUTTONS}">
            <button class="btn btn-primary ${COMPONENTS_CN.EXTRA_CLOSER}" tabindex="1">ОК</button>
          </div>
        </div>
      </div>
    `,

    CONFIRM: `
      <div class="${COMPONENTS_CN.INNER}">
        <button class="${COMPONENTS_CN.FW_CLOSER}" tabindex="-1"></button>
        <div class="${COMPONENTS_CN.POPUP}">
          <button class="${COMPONENTS_CN.CLOSER}" tabindex="0"></button>
          <div class="${COMPONENTS_CN.CONTENT}">$content</div>
          <div class="mt-2 text-center ${COMPONENTS_CN.CONTENT_BUTTONS}">
            <button id="${HTML_IDS.CONFIRM_OK}" class="btn btn-primary mr-1" tabindex="1">ОК</button>
            <button class="btn btn-secondary ${COMPONENTS_CN.EXTRA_CLOSER}" tabindex="2">Отмена</button>
          </div>
        </div>
      </div>
    `,
  };

  const MODAL_ANIM_TIME = 330;


  const modals = {};
  let htmlIdAutoIncrementCounter = 1;


  /**
   * Модалки для проекта.
   */
  class Modal {
    /**
     * Создаёт модалку на основе экземпляра Vpopape.
     * @param {Object}  props             Все параметры – необязательны.
     * @param {String}  props.htmlId      Значение HTML-аттрибута `id`.
     * @param {Boolean} props.noClosers   Если true, пользователь не сможет сам закрыть такой попап.
     * @param {String}  props.htmlContent HTML–контент модалки.
     * @return {*}
     */
    constructor(props = {}) {
      const {htmlId} = props;
      if (modals[htmlId]) return modals[htmlId];

      this._props = {...props};

      const popup = document.getElementById(htmlId);
      if (!htmlId || !popup) {
        this.element = Modal.createModalElem(props);
        document.body.appendChild(this.element);
      } else {
        this.element = popup;
        this._updateModalStructure();
      }

      const closers = this.element.querySelectorAll([
        `.${COMPONENTS_CN.FW_CLOSER}`,
        `.${COMPONENTS_CN.CLOSER}`,
        `.${COMPONENTS_CN.EXTRA_CLOSER}`,
      ].join(','));

      // Об опциях можно почитать в доках к Vpopape.
      const modal = new Vpopape({
        popup: this.element,
        animationTime: MODAL_ANIM_TIME,
        closers: props.noClosers ? null : closers,
        hideOnEsc: !props.noClosers,
        dontHideOnOutsideClick: props.noClosers,
        activeClassname: COMPONENTS_CN.BLOCK_ACTIVE,
      });

      modal.on('afterBeforeShow', Modal._freezeBody);
      modal.on('afterHide', Modal._unfreezeBody);

      this.vpopape = modal;
      modals[htmlId] = this;
    }


    /**
     * Возвращает экземпляр по id.
     * @param {String} htmlId
     * @return {boolean|*}
     */
    static getModal(htmlId) {
      if (htmlId in modals) {
        return modals[htmlId];
      }

      return false;
    }


    /**
     * Создаёт DOM-элемент для модалки (с необходимой структурой).
     * @param {Object} props См. описание у конструктора.
     * @return {HTMLElement}
     */
    static createModalElem(props = {}) {
      const htmlId = props.htmlId || HTML_IDS.AUTO + htmlIdAutoIncrementCounter++;

      const dom = document.createElement('div');
      dom.id = htmlId;
      dom.className = COMPONENTS_CN.BLOCK;

      let tpl;
      if (props.template) {
        tpl = props.template;
      } else {
        tpl = props.noClosers
          ? TEMPLATES.INNER_WO_CLOSERS
          : TEMPLATES.INNER;
      }

      dom.innerHTML = props.htmlContent
        ? tpl.replace('$content', props.htmlContent)
        : tpl.replace('$content', '');

      return dom;
    }


    /**
     * Устанавливает обработчики, помогающие управлять модалками из HTML.
     */
    static listenDataAttributes() {
      if (Modal._listeningDataAttributes) return;
      Modal._listeningDataAttributes = true;
      document.addEventListener('click', Modal._handleDocumentClick);
    }


    /**
     * Показывает сообщение в модалке, аля alert()
     * @param {String} html
     */
    static alert(html) {
      if (!(HTML_IDS.ALERT in modals)) {
        new Modal({
          htmlId: HTML_IDS.ALERT,
          template: TEMPLATES.ALERT,
        });
      }

      modals[HTML_IDS.ALERT].element.querySelector(`.${COMPONENTS_CN.CONTENT}`).innerHTML = html;
      modals[HTML_IDS.ALERT].vpopape.showPopup();
    }


    /**
     * Вызывает модалку для подтверждения какого-либо действия.
     * @param {String} html
     * @param {Function | String} cb  Функция, которая будет вызвана, в случае нажатия на кнопку "ОК".
     *                                Можно передать строку, если до функции можно добраться из глобальной области видимости.
     *                                Например, по строке `one.two.three` будет найдена функция `window.one.two.three`.
     *
     * @param {*} cbParams            Объект с параметрами для колбэка.
     */
    static confirm(html, cb, cbParams = {}) {
      if (!(HTML_IDS.CONFIRM in modals)) {
        new Modal({
          htmlId: HTML_IDS.CONFIRM,
          template: TEMPLATES.CONFIRM,
        });

        const okBut = modals[HTML_IDS.CONFIRM].element.querySelector(`#${HTML_IDS.CONFIRM_OK}`);
        okBut.addEventListener('click', Modal._handleConfirm);
      }

      modals[HTML_IDS.CONFIRM].element.querySelector(`.${COMPONENTS_CN.CONTENT}`).innerHTML = html;
      modals[HTML_IDS.CONFIRM].vpopape.setOption('confirmHandler', cb);
      modals[HTML_IDS.CONFIRM].vpopape.setOption('confirmHandlerParams', cbParams);
      modals[HTML_IDS.CONFIRM].vpopape.showPopup();
    }

    /**
     * Обработчик для кнопки ОК у модалки Confirm.
     * @private
     */
    static _handleConfirm() {
      const cb = Modal._getFunctionByPath( modals[HTML_IDS.CONFIRM].vpopape.getOption('confirmHandler') );
      const params = modals[HTML_IDS.CONFIRM].vpopape.getOption('confirmHandlerParams');
      modals[HTML_IDS.CONFIRM].vpopape.hidePopup();
      cb(params);
    }


    /**
     * Метод для поиска колбэка (использует модалка Confirm).
     * @param {Function | String} cb
     * @return {Function}
     * @private
     */
    static _getFunctionByPath(cb) {
      if (typeof cb === 'function') return cb;
      // Пытаемся найти функцию в глобальной области видимости.
      try {
        return (cb + '')
          .split('.')
          .reduce((acc, key) => acc[key], window);
      } catch (e) {
        throw new Error('Функцию-колбэк не найдена');
      }
    }


    /**
     * Замораживает body, когда открывается модалка.
     * @private
     */
    static _freezeBody() {
      const body = document.body;
      if (body.dataset.modalFrozen) return;
      body.dataset.modalFrozen = true;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.paddingRight = scrollbarWidth + 'px';
      body.style.overflow = 'hidden';
    }


    /**
     * Размораживает body, когда последня модалка закрывается.
     * @private
     */
    static _unfreezeBody() {
      setTimeout(() => {
        const hasShown = Object.keys(modals).some((key) => modals[key].vpopape.isShown());
        if (hasShown) return;

        document.body.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        document.body.dataset.modalFrozen = '';
      }, 0);
    }


    /**
     * Обработчик кликов, на элементах, связанных с модалками.
     * @param {EventListenerObject} e
     * @private
     */
    static _handleDocumentClick(e) {
      let target = e.target;

      while (target && target !== document.documentElement) {
        if (target.getAttribute(ATTRIBUTES.CALLER) !== null) {
          Modal._handleCallerAttribute(target);
          e.preventDefault();

          if (!target.getAttribute(ATTRIBUTES.CONTINUE)) {
            return;
          }
        }

        if (target.getAttribute(ATTRIBUTES.ALERT) !== null) {
          Modal.alert(target.getAttribute(ATTRIBUTES.ALERT));
          e.preventDefault();

          if (!target.getAttribute(ATTRIBUTES.CONTINUE)) {
            return;
          }
        }

        if (target.getAttribute(ATTRIBUTES.CONFIRM) !== null) {
          Modal.confirm(
            target.getAttribute(ATTRIBUTES.CONFIRM),
            target.getAttribute(ATTRIBUTES.CONFIRM_CB),
            target.getAttribute(ATTRIBUTES.CONFIRM_PARAMS)
          );
          e.preventDefault();

          if (!target.getAttribute(ATTRIBUTES.CONTINUE)) {
            return;
          }
        }

        if (target.getAttribute(ATTRIBUTES.CLOSER) !== null) {
          Modal._handleCloserAttribute(target);
          e.preventDefault();
        }

        target = target.parentNode;
      }
    }


    /**
     * Открывает попап по ID, указанному в атрибуте.
     * @param {HTMLElement} target HTML-элемент с нужным атрибутом.
     * @private
     */
    static _handleCallerAttribute(target) {
      const htmlId = target.getAttribute(ATTRIBUTES.CALLER);

      if (htmlId in modals) {
        modals[htmlId].vpopape.showPopup();
        return;
      }

      const cloneSrc = document.getElementById(target.getAttribute(ATTRIBUTES.CLONE_FROM));
      const htmlContent = cloneSrc ? cloneSrc.innerHTML : '';

      new Modal({htmlId, htmlContent}).vpopape.showPopup();
    }

    /**
     * Закрывает попап по ID, указанному в атрибуте.
     * @param {HTMLElement} target HTML-элемент с нужным атрибутом.
     * @private
     */
    static _handleCloserAttribute(target) {
      const htmlId = target.getAttribute(ATTRIBUTES.CLOSER);

      if (!(htmlId in modals) || !modals[htmlId].vpopape.isShown()) {
        return;
      }

      modals[htmlId].vpopape.hidePopup();
    }


    /**
     * Создаёт необходимую структуру для модалки
     * @private
     */
    _updateModalStructure() {
      // Будём считать, что структура и так уже готова.
      if (this.element.querySelector(`.${COMPONENTS_CN.INNER}`)) return;

      // Нужны прямые потомки, но не нужна живая коллекция.
      const childrenArray = [].map.call(this.element.children, (child) => child);

      this.element.insertAdjacentHTML('beforeEnd',
        this._props.noClosers
          ? TEMPLATES.INNER_WO_CLOSERS.replace('$content', '')
          : TEMPLATES.INNER.replace('$content', '')
      );
      const content = this.element.querySelector('.' + COMPONENTS_CN.CONTENT);

      childrenArray.forEach((child) => content.appendChild(child));
    }
  }

  window.Modal = Modal;
})();

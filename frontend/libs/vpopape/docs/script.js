document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // "Under the cut" blocks
  (function () {
    var CUT_CLNAME = 'cut';
    var CUT_HIDING_CLNAME = 'cut_hiding';
    var CUT_LINKED_CLNAME = 'cut_linked';
    var CUT__INNER_CLNAME = 'cut__inner';
    var BUTTON_CLNAME = 'cut-button';
    var BUTTON_ACTIVE_CLNAME = 'cut-button_active';

    showLinkedCutOnStart();
    var cutButtons = document.querySelectorAll('.' + BUTTON_CLNAME);
    [].forEach.call(cutButtons, setCutHandlers);

    function setCutHandlers(button) {
      var cut = button.parentNode.nextElementSibling;
      if (!cut || !cut.classList.contains(CUT_CLNAME)) {
        return;
      }
      var cutInner = cut.querySelector('.' + CUT__INNER_CLNAME);
      window.addEventListener('resize', resizeHandler);

      var vpopape = new Vpopape({
        popup: cut,
        hidingClassname: CUT_HIDING_CLNAME,
        callers: [cut, button],
        closers: button,
        dontHideOnOutsideClick: true,
        afterBeforeShow: afterBeforeShowHandler,
        beforeHide: beforeHideHandler,
        beforeAfterHide: beforeAfterHideHandler,
        animationTime: 100,
      });

      function afterBeforeShowHandler() {
        cut.style.height = cutInner.offsetHeight + 'px';
        button.classList.add(BUTTON_ACTIVE_CLNAME);
      }

      function beforeHideHandler() {
        if (!cut.classList.contains(CUT_LINKED_CLNAME)) {
          return;
        }

        cut.style.height = cutInner.offsetHeight + 'px';
        cut.classList.remove(CUT_LINKED_CLNAME);
      }

      function beforeAfterHideHandler() {
        cut.style.height = '';
        button.classList.remove(BUTTON_ACTIVE_CLNAME);
      }

      function resizeHandler() {
        if (vpopape.isShown()) {
          cut.style.height = cutInner.offsetHeight + 'px';
        }
      }
    }

    function showLinkedCutOnStart() {
      if (!window.location.hash) {
        return;
      }
      var linked = document.querySelector(window.location.hash);
      if (!linked) {
        return;
      }
      var linkedCut = linked.nextElementSibling;
      if (!linkedCut || !linkedCut.classList.contains(CUT_CLNAME)) {
        return;
      }

      linkedCut.classList.add(CUT_LINKED_CLNAME);
      linkedCut.classList.remove(CUT_HIDING_CLNAME);

      var button = linked.querySelector('button');
      if (button) {
        button.classList.add(BUTTON_ACTIVE_CLNAME);
      }
    }
  })();
});

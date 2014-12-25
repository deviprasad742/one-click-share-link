document.addEventListener('DOMContentLoaded', function () {
    // first load ui with stored values
    loadInboxUI(true);
    // load ui later after syncing data
    checkAndsyncData(loadInboxUI);
});

DIV_IN_LINKS_ID = "inbox-links-div";


function loadInboxUI(loaded) {
    if (loaded) {
        clearInLinks();
        addLinks(DIV_IN_LINKS_ID, getInLinks(), true);
    }
}
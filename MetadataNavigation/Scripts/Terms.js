var context = SP.ClientContext.get_current();
var termsHTML;

// This code runs when the DOM is ready and creates a context object which is needed to use the SharePoint object model
$(document).ready(function () {
    getTermSet('Taxonomy_2wzqpytxkbENkepeLOcgqg==', '8135b4c9-7d06-4d50-8bc7-67e3137f4d95');
});

function getTermSet(termStoreName, termSetId) {

    //Current Taxonomy Session
    var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);

    //Term Stores
    var termStores = taxSession.get_termStores();

    //Name of the Term Store from which to get the Terms.
    var termStore = termStores.getByName(termStoreName);

    //GUID of Term Set from which to get the Terms.
    var termSet = termStore.getTermSet(termSetId);
    var terms = termSet.get_terms();

    context.load(terms);
    context.executeQueryAsync(function () {

        var termEnumerator = terms.getEnumerator();
        termsHTML = "<ul id=\"navmenu\">";

        while (termEnumerator.moveNext()) {
            var currentTerm = termEnumerator.get_current();
            var termId = currentTerm.get_id();
            var termName = currentTerm.get_name();
            var childTermCount = currentTerm.get_termsCount();
            var props = currentTerm.get_localCustomProperties();

            var navLink = props["_Sys_Nav_SimpleLinkUrl"];

            termsHTML += "<li id=\"" + termId + "\"><a href=\"" + navLink + "\">" + termName + " (" + childTermCount + ")</a></li>";

            //Check if term has child terms.
            if (childTermCount > 0) {

                //Term has sub terms.
                recursiveTerms(currentTerm);
            }
        }

        termsHTML += "</ul>";
        $('#TopMenu').html(termsHTML);

    }, onGetFail);
}

function recursiveTerms(currentTerm) {

    //Get Term child terms
    var terms = currentTerm.get_terms();

    context.load(terms);
    context.executeQueryAsync(function () {
        getTerms(terms, currentTerm);
    }, onGetFail);

}

function getTerms(terms, parent) {
    var termsEnum = terms.getEnumerator();
    var childTermsHTML = "<ul>";
    while (termsEnum.moveNext()) {

        var newCurrentTerm = termsEnum.get_current();
        var termId = newCurrentTerm.get_id();
        var termName = newCurrentTerm.get_name();
        var childTermCount = newCurrentTerm.get_termsCount();
        var props = newCurrentTerm.get_localCustomProperties();

        var navLink = props["_Sys_Nav_SimpleLinkUrl"];

        childTermsHTML += "<li id=\"" + termId + "\"><a href=\"" + navLink + "\">" + termName + " (" + childTermCount + ")</a></li>";

        //Check if term has child terms.
        if (childTermCount > 0) {

            //Term has sub terms.
            recursiveTerms(newCurrentTerm);
        }
    }

    var HTMLID = "#" + parent.get_id();
    $(HTMLID).append(childTermsHTML + "</ul>");
    childTermsHTML = "";
}

// This function is executed if the call fails
function onGetFail(sender, args) {
    alert('Error:' + args.get_message());
}
sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"bookshop/fioribooks/fioribooks/test/integration/pages/BooksList.gen",
	"bookshop/fioribooks/fioribooks/test/integration/pages/BooksObjectPage.gen"
], function (JourneyRunner, BooksListGenerated, BooksObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('bookshop/fioribooks/fioribooks') + '/test/flp.html#app-preview',
        pages: {
			onTheBooksListGenerated: BooksListGenerated,
			onTheBooksObjectPageGenerated: BooksObjectPageGenerated
        },
        async: true
    });

    return runner;
});


using { sap.capire.bookshop as my } from '../db/schema';

annotate CatalogService.Books with @(
    UI.LineItem: [
        { Value: title, Label: 'Title' },
        { Value: stock, Label: 'Stock' },
        { Value: price, Label: 'Price' }
    ]
);

@(requires: 'any')
service CatalogService @(odata:'/browse') {
  @readonly entity Books as projection on my.Books {
    *,
    author.name as author,
    genre.name as genre,
  } excluding { createdBy, modifiedBy };
}
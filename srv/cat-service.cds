using { sap.capire.bookshop as my } from '../db/schema';
@(requires: 'any')
service CatalogService @(odata:'/browse') {
  @readonly entity Books as projection on my.Books {
    *, // all fields with the following denormalizations:
    author.name as author,
    genre.name as genre,
  } excluding { createdBy, modifiedBy };

};

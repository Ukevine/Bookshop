using { sap.capire.bookshop as my } from '../db/schema';

@(requires: 'authenticated-user')          
@odata: '/fiori'
service FioriService {

    @odata.draft.enabled
    @restrict: [
        { grant: 'READ', to: ['CatalogViewer', 'Admin'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    entity Books as projection on my.Books {
        *,
        author.name as authorName,
        genre.name as genreName
    };

    @readonly
    @restrict: [
        { grant: 'READ', to: ['CatalogViewer', 'Admin'] }
    ]
    entity Authors as projection on my.Authors;

    @readonly
    @restrict: [
        { grant: 'READ', to: ['CatalogViewer', 'Admin'] }
    ]
    entity Genres as projection on my.Genres;
}
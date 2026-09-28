using {sap.capire.bookshop as my} from '../db/schema';
@(requires: 'Admin')
service AdminService @(odata: '/admin') {

     @restrict: [
        { grant: 'READ', to: ['CatalogViewer', 'Admin'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'Admin' }
    ]
    @title: '{i18n>Authors}'
    entity Authors as projection on my.Authors;

    @title: '{i18n>Books}'
    @cds.redirection.target
    entity Books   as projection on my.Books
         actions {
               action restock(amount: Integer) returns Integer;
    };

    @title: '{i18n>Genres}'
    entity Genres  as projection on my.Genres;
    entity OrderItems as projection on my.OrderItems;
    entity Orders as projection on my.Orders
    actions {
        action cancelOrder() returns String;
    };

    action processOrder(
    bookID: Integer,
    quantity: Integer,
    customerID: Integer
) returns String;

    function getStockLevel(bookID: Integer) returns Integer;
    
    entity StockReport as projection on my.Books {
        *,
        ID,
        title,
        stock,
        price,
        stock * price as totalValue : Decimal(9,2),
        author.name as authorName,
        case
            when stock = 0 then 'OUT OF STOCK'
            when stock < 5 then 'LOW STOCK'
            when stock < 20 then 'NORMAL'
            else 'HIGH STOCK'
        end as stockLevel : String(20)
    } excluding { createdBy, modifiedBy };

   entity Customers as projection on my.Customers;
   entity PurchaseLogs as projection on my.PurchaseLogs;
}

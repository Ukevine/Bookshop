using { Currency, cuid, managed, sap } from '@sap/cds/common';
// using { Attachments } from '@cap-js/attachments';

namespace sap.capire.bookshop;

entity Books : managed {
  key ID : Integer;
  title  :  String @mandatory;
  descr  :  String;
  author : Association to Authors;
  genre  : Association to Genres;
  stock  : Integer @assert.range: [0, _]; 
  price  : Decimal @assert.range: [1, 111]; 
  // attachments : Composition of many Attachments;
  currency : Currency;
}
// annotate Books.attachments with`
//     @Capabilities.UpdateRestrictions.NonUpdatableProperties: [] {};

entity Authors : managed {
  key ID : Integer;
  name   : String @mandatory;
  books  : Association to many Books on books.author = $self;
}

entity Genres : sap.common.CodeList {
  key ID : Integer;
  name   : String @mandatory;
  parent : Association to Genres;
}

entity Orders : cuid, managed {
  customerName : String(100) @mandatory;
  orderDate    : Timestamp;
  status       : String(20) default 'PENDING';
  
  items : Composition of many OrderItems
      on items.order = $self;
}
entity OrderItems : cuid, managed {
  quantity : Integer @assert.range: [1, _];  
  unitPrice : Decimal(9,2);
  
  book : Association to Books;               
  order : Association to Orders;             
}
entity PurchaseLogs : managed {
    key ID : Integer;
    order_ID : Integer;
    customerName : String(100);
    book_ID : Integer;
    bookTitle : String(255);
    quantity : Integer;
    totalCost : Decimal(9,2);
    logDate : Timestamp;
    message : String(500);
}
entity Customers : managed {
    key ID : Integer;
    name : String(100) @mandatory;
    email : String(255) @mandatory;
    budget : Decimal(9,2) @assert.range: [0, _];
    spent : Decimal(9,2) default 0;
}
using { API_BUSINESS_PARTNER as external } from './external/API_BUSINESS_PARTNER';

@path: '/suppliers'
@(requires: 'any')
service SupplierService {
    entity Suppliers as projection on external.A_Supplier;
}
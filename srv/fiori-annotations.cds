using { FioriService } from './fiori-service';

annotate FioriService.Books with @(
    UI.HeaderInfo: {
        TypeName: '{i18n>Book}',
        TypeNamePlural: '{i18n>Books}',
        Title: { Value: title },
        Description: { Value: authorName }
    }
);

annotate FioriService.Books with @(
    UI.LineItem: [
        { Value: ID,         Label: '{i18n>ID}' },
        { Value: title,      Label: '{i18n>bookTitle}' },
        { Value: authorName, Label: '{i18n>bookAuthor}' },
        { Value: genreName,  Label: '{i18n>bookGenre}' },
        { Value: stock,      Label: '{i18n>bookStock}' },
        { Value: price,      Label: '{i18n>bookPrice}' }
    ],
        UI.SelectionFields: [
        title,
        authorName,
        genreName,
        stock
    ],
        UI.FieldGroup #General: {
        Label: '{i18n>GeneralInformation}',
        Data: [
            { Value: title,      Label: '{i18n>bookTitle}' },
            { Value: authorName, Label: '{i18n>bookAuthor}' },
            { Value: genreName,  Label: '{i18n>bookGenre}' }
        ]
    },
        UI.FieldGroup #Inventory: {
        Label: '{i18n>InventoryPricing}',
        Data: [
            { Value: stock, Label: '{i18n>bookStock}' },
            { Value: price, Label: '{i18n>bookPrice}' }
        ]
    }
);


annotate FioriService.Books with {
    genreName @(
        Common: {
            Text: genreName,
            TextArrangement: #TextOnly,
            ValueList: {
                Label: '{i18n>SelectGenre}',
                CollectionPath: 'Genres',
                Parameters: [
                    {
                        $Type: 'Common.ValueListParameterInOut',
                        LocalDataProperty: genreName,
                        ValueListProperty: 'name'
                    }
                ]
            }
        }
    );
}
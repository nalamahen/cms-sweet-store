module.exports = function(discontCodes, product) {
    discontCodes.map(code => {
        let codeWithDiscount = code.split('-');         
        let brand = codeWithDiscount[0].replace(' ', '-');
        let percentage = codeWithDiscount[1];
        
        if(brand === product.brand) {
            let discount =  (product.price * percentage/100);
            product.price = parseFloat(product.price - discount).toFixed(2);                
        }
                               
    }); 

    return product;
}
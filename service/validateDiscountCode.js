module.exports = function hasValidDiscountCode (discountCodes, brands) {

    let hasValidCode = false;

        if(discountCodes.length >= 1) {
            discountCodes.filter(code => {
                let brand = code.split('-')[0].toLowerCase().replace(' ', '-');
                if(code.includes('-') && brands.indexOf(brand) > -1) {                                       
                    hasValidCode = true;                   
                }
            });
        }

        return hasValidCode;
}
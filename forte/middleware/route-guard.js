'use strict';

module.exports = ((req,res,next) =>{
    console.log('Middleware is running')
    if (req.company) {
        const companyUrl = req.params.url;
        // console.log('this is the parameters', req.params.url);
        // console.log('This is what i have in the route-guard',req.company.url);
        if (companyUrl === req.company.url) {
            // console.log('comparisson worked!');
            next();
        } else {
            res.redirect('/sign-in');
            console.log('first verification false')
        }
    } else {
        //console.log(req.params.companyName);
        res.redirect('/sign-in');
        console.log('second verification false')
        //next(new Error('User has no permission to visit that page.'));
    }
});
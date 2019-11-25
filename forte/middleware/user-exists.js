'use strict';

module.exports = ((req,res,next) =>{

    if (req.company) {
        const companyUrl = req.params.url;
        // console.log('this is the parameters', req.params.url);
        // console.log('This is what i have in the route-guard',req.company.url);
        if (companyUrl === req.company.url) {
            // console.log('comparisson worked!');
            next();
        } else {
            res.redirect('/sign-in');
        }
    } else {
        //console.log(req.params.companyName);
        res.redirect('/sign-in');
        //next(new Error('User has no permission to visit that page.'));
    }
});
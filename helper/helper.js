//authentication
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Action not allowed!');
        res.redirect('/');
    }
}

//superadmin check
function isAdmin(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role == 'superadmin'){
            return next();
        } else {
            req.flash('danger', 'Action not allowed!');
            res.redirect('/');
        }
    }
}

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.isAdmin = isAdmin;
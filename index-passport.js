require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oidc');

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

const session = require('express-session');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'asda21e2e',
    resave: false,
    saveUninitialized: true,
  }))

var { Liquid } = require('liquidjs');
var engine = new Liquid();

// register liquid engine
app.engine('liquid', engine.express()); 
app.set('views', './views');            // specify the views directory
app.set('view engine', 'liquid'); 



app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    function(username, password, done) {
        if (username == 'user' && password == '123') {
            done(null, {
                login: 'user',
                name: 'Username'
            });
        } else {
            done(null, false);
        }
    }
  ));

  passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  function(issuer, profile, done) {
    done(null, {
        login: profile.emails[0].value,
        name: profile.displayName
    });
  }
));

function authAdmin(req, res, next) {
    if (req.user?.username != 'admin') {
        res.sendStatus(403);
        return;
    }
    next();
}

function redirectLogin(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
        return;
    }
    next();
}

app.get('/', redirectLogin, (req,res) => {
    console.log(req.user)
    res.render('index', {
        result: req.user?.name
    });
})

app.get('/page', authAdmin, (req, res) => {
    res.render('page');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), 
(req, res) => {
    // NOT OK
   res.redirect('/');
 })



app.get('/login/google', passport.authenticate('google', {
    scope: [ 'email', 'profile' ]
  }));

  app.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
    function(req, res) {
      res.redirect('/');
    });

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


app.listen(3000);
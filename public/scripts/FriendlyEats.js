'use strict';

function FriendlyEats() {
    this.filters = {
        cp: 'Any',
        sort: 'viewCnt'
    };

    this.dialogs = {};

    var that = this;
    firebase.auth().signInAnonymously().then(function () {
        that.initTemplates();
        that.initRouter();
        that.initFilterDialog();
    }).catch(function (err) {
        console.log(err);
    });
}

/**
 * Initializes the router for the FriendlyEats app.
 */
FriendlyEats.prototype.initRouter = function () {
    this.router = new Navigo();

    var that = this;
    this.router
        .on({
            '/': function () {
                that.updateQuery(that.filters);
            }
        })
        .on({
            '/setup': function () {
                that.viewSetup();
            }
        })
        .resolve();

    firebase
        .firestore()
        .collection('docs_v2')
        .limit(1)
        .onSnapshot(function (snapshot) {
            if (snapshot.empty) {
                that.router.navigate('/setup');
            }
        });
};

FriendlyEats.prototype.getCleanPath = function (dirtyPath) {
    if (dirtyPath.startsWith('/index.html')) {
        return dirtyPath.split('/').slice(1).join('/');
    } else {
        return dirtyPath;
    }
};

FriendlyEats.prototype.getFirebaseConfig = function () {
    return firebase.app().options;
};

FriendlyEats.prototype.getRandomItem = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

FriendlyEats.prototype.data = {
    cps:[
        'clien',
        'ou',
        'bbdream',
        'utdae',
        'instiz',
        'ppomppu',
        'mlb',
        'fmkorea',
        'cook82',
        'inven',
        'ruliweb',
        'slr',
        'dc',
        'theqoo',
        'dogdrip',
        'meeco'
    ],
};

window.onload = function () {
    window.app = new FriendlyEats();
};

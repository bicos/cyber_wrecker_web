'use strict';

FriendlyEats.prototype.initTemplates = function () {
    this.templates = {};

    var that = this;
    document.querySelectorAll('.template').forEach(function (el) {
        that.templates[el.getAttribute('id')] = el;
    });
};

FriendlyEats.prototype.viewHome = function () {
    this.getAllDocs();
};

FriendlyEats.prototype.viewList = function (filters, filter_description) {
    if (!filter_description) {
        filter_description = 'any type of food with any price in any city.';
    }

    var mainEl = this.renderTemplate('main-adjusted');
    var headerEl = this.renderTemplate('header-base', {
        hasSectionHeader: true
    });

    this.replaceElement(
        headerEl.querySelector('#section-header'),
        this.renderTemplate('filter-display', {
            filter_description: filter_description
        })
    );

    this.replaceElement(document.querySelector('.header'), headerEl);
    this.replaceElement(document.querySelector('main'), mainEl);

    var that = this;
    headerEl.querySelector('#show-filters').addEventListener('click', function () {
        that.dialogs.filter.show();
    });

    var renderer = {
        remove: function (doc) {
            var locationCardToDelete = mainEl.querySelector('#doc-' + doc.id);
            if (locationCardToDelete) {
                mainEl.querySelector('#cards').removeChild(locationCardToDelete.parentNode);
            }

            return;
        },
        display: function (doc) {
            var data = doc.data();
            data['.id'] = doc.id;
            data['go_to_restaurant'] = function () {
                that.router.navigate('/restaurants/' + doc.id);
            };

            var el = that.renderTemplate('restaurant-card', data);
            // el.querySelector('.rating').append(that.renderRating(data.avgRating));
            // el.querySelector('.price').append(that.renderPrice(data.price));
            // Setting the id allows to locating the individual restaurant card
            el.querySelector('.location-card').id = 'doc-' + doc.id;

            var existingLocationCard = mainEl.querySelector('#doc-' + doc.id);
            if (existingLocationCard) {
                // modify
                existingLocationCard.parentNode.before(el);
                mainEl.querySelector('#cards').removeChild(existingLocationCard.parentNode);
            } else {
                // add
                mainEl.querySelector('#cards').append(el);
            }
        },
        empty: function () {
            var headerEl = that.renderTemplate('header-base', {
                hasSectionHeader: true
            });

            var noResultsEl = that.renderTemplate('no-results');

            that.replaceElement(
                headerEl.querySelector('#section-header'),
                that.renderTemplate('filter-display', {
                    filter_description: filter_description
                })
            );

            headerEl.querySelector('#show-filters').addEventListener('click', function () {
                that.dialogs.filter.show();
            });

            that.replaceElement(document.querySelector('.header'), headerEl);
            that.replaceElement(document.querySelector('main'), noResultsEl);
            return;
        }
    };

    if (filters.city || filters.category || filters.price || filters.sort !== 'Rating') {
        this.getFilteredDocs({
            city: filters.city || 'Any',
            category: filters.category || 'Any',
            price: filters.price || 'Any',
            sort: filters.sort
        }, renderer);
    } else {
        this.getAllDocs(renderer);
    }

    var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
    toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');

    mdc.autoInit();
};

FriendlyEats.prototype.viewSetup = function () {
    var headerEl = this.renderTemplate('header-base', {
        hasSectionHeader: false
    });

    var config = this.getFirebaseConfig();
    var noRestaurantsEl = this.renderTemplate('no-restaurants', config);

    this.replaceElement(document.querySelector('.header'), headerEl);
    this.replaceElement(document.querySelector('main'), noRestaurantsEl);

    // firebase
    //     .firestore()
    //     .collection('docs_v2')
    //     .limit(1)
    //     .onSnapshot(function (snapshot) {
    //         if (snapshot.size) {
    //             that.router.navigate('/');
    //         }
    //     });
};

FriendlyEats.prototype.initFilterDialog = function () {
    // TODO: Reset filter dialog to init state on close.
    this.dialogs.filter = new mdc.dialog.MDCDialog(document.querySelector('#dialog-filter-all'));

    var that = this;
    this.dialogs.filter.listen('MDCDialog:accept', function () {
        that.updateQuery(that.filters);
    });

    var dialog = document.querySelector('aside');
    var pages = dialog.querySelectorAll('.page');

    this.replaceElement(
        dialog.querySelector('#cp-list'),
        this.renderTemplate('item-list', {items: ['Any'].concat(this.data.cps)})
    );

    var renderAllList = function () {
        that.replaceElement(
            dialog.querySelector('#all-filters-list'),
            that.renderTemplate('all-filters-list', that.filters)
        );

        dialog.querySelectorAll('#page-all .mdc-list-item').forEach(function (el) {
            el.addEventListener('click', function () {
                var id = el.id.split('-').slice(1).join('-');
                displaySection(id);
            });
        });
    };

    var displaySection = function (id) {
        if (id === 'page-all') {
            renderAllList();
        }

        pages.forEach(function (sel) {
            if (sel.id === id) {
                sel.style.display = 'block';
            } else {
                sel.style.display = 'none';
            }
        });
    };

    pages.forEach(function (sel) {
        var type = sel.id.split('-')[1];
        if (type === 'all') {
            return;
        }

        sel.querySelectorAll('.mdc-list-item').forEach(function (el) {
            el.addEventListener('click', function () {
                that.filters[type] = el.innerText.trim() === 'Any' ? '' : el.innerText.trim();
                displaySection('page-all');
            });
        });
    });

    displaySection('page-all');
    dialog.querySelectorAll('.back').forEach(function (el) {
        el.addEventListener('click', function () {
            displaySection('page-all');
        });
    });
};

FriendlyEats.prototype.updateQuery = function (filters) {
    var query_description = '';

    // if (filters.category !== '') {
    //   query_description += filters.category + ' places';
    // } else {
    //   query_description += 'any restaurant';
    // }
    //
    // if (filters.city !== '') {
    //   query_description += ' in ' + filters.city;
    // } else {
    //   query_description += ' located anywhere';
    // }
    //
    // if (filters.price !== '') {
    //   query_description += ' with a price of ' + filters.price;
    // } else {
    //   query_description += ' with any price';
    // }
    //
    // if (filters.sort === 'Rating') {
    //   query_description += ' sorted by rating';
    // } else if (filters.sort === 'Reviews') {
    //   query_description += ' sorted by # of reviews';
    // }

    this.viewList(filters, query_description);
};

FriendlyEats.prototype.renderTemplate = function (id, data) {
    var template = this.templates[id];
    var el = template.cloneNode(true);
    el.removeAttribute('hidden');
    // console.log(data['category']);
    this.render(el, data);
    return el;
};

FriendlyEats.prototype.render = function (el, data) {
    if (!data) {
        return;
    }

    var that = this;
    var modifiers = {
        'data-fir-foreach': function (tel) {
            var field = tel.getAttribute('data-fir-foreach');
            var values = that.getDeepItem(data, field);

            values.forEach(function (value, index) {
                var cloneTel = tel.cloneNode(true);
                tel.parentNode.append(cloneTel);

                Object.keys(modifiers).forEach(function (selector) {
                    var children = Array.prototype.slice.call(
                        cloneTel.querySelectorAll('[' + selector + ']')
                    );
                    children.push(cloneTel);
                    children.forEach(function (childEl) {
                        var currentVal = childEl.getAttribute(selector);

                        if (!currentVal) {
                            return;
                        }
                        childEl.setAttribute(
                            selector,
                            currentVal.replace('~', field + '/' + index)
                        );
                    });
                });
            });

            tel.parentNode.removeChild(tel);
        },
        'data-fir-content': function (tel) {
            var field = tel.getAttribute('data-fir-content');
            tel.innerText = that.getDeepItem(data, field);
        },
        'data-fir-click': function (tel) {
            tel.addEventListener('click', function () {
                var field = tel.getAttribute('data-fir-click');
                that.getDeepItem(data, field)();
            });
        },
        'data-fir-if': function (tel) {
            var field = tel.getAttribute('data-fir-if');
            if (!that.getDeepItem(data, field)) {
                tel.style.display = 'none';
            }
        },
        'data-fir-if-not': function (tel) {
            var field = tel.getAttribute('data-fir-if-not');
            if (that.getDeepItem(data, field)) {
                tel.style.display = 'none';
            }
        },
        'data-fir-attr': function (tel) {
            var chunks = tel.getAttribute('data-fir-attr').split(':');
            var attr = chunks[0];
            var field = chunks[1];
            tel.setAttribute(attr, that.getDeepItem(data, field));
        },
        'data-fir-style': function (tel) {
            var chunks = tel.getAttribute('data-fir-style').split(':');
            var attr = chunks[0];
            var field = chunks[1];
            var value = that.getDeepItem(data, field);

            if (attr.toLowerCase() === 'backgroundimage') {
                value = 'url(' + value + ')';
            }
            tel.style[attr] = value;
        }
    };

    var preModifiers = ['data-fir-foreach'];

    preModifiers.forEach(function (selector) {
        var modifier = modifiers[selector];
        that.useModifier(el, selector, modifier);
    });

    Object.keys(modifiers).forEach(function (selector) {
        if (preModifiers.indexOf(selector) !== -1) {
            return;
        }

        var modifier = modifiers[selector];
        that.useModifier(el, selector, modifier);
    });
};

FriendlyEats.prototype.useModifier = function (el, selector, modifier) {
    el.querySelectorAll('[' + selector + ']').forEach(modifier);
};

FriendlyEats.prototype.getDeepItem = function (obj, path) {
    path.split('/').forEach(function (chunk) {
        obj = obj[chunk];
    });

    if (Array.isArray(obj)) {
        return obj[0];
    } else {
        return obj;
    }
};

// FriendlyEats.prototype.renderRating = function(rating) {
//   var el = this.renderTemplate('rating', {});
//   for (var r = 0; r < 5; r += 1) {
//     var star;
//     if (r < Math.floor(rating)) {
//       star = this.renderTemplate('star-icon', {});
//     } else {
//       star = this.renderTemplate('star-border-icon', {});
//     }
//     el.append(star);
//   }
//   return el;
// };

// FriendlyEats.prototype.renderPrice = function(price) {
//   var el = this.renderTemplate('price', {});
//   for (var r = 0; r < price; r += 1) {
//     el.append('$');
//   }
//   return el;
// };

FriendlyEats.prototype.replaceElement = function (parent, content) {
    parent.innerHTML = '';
    parent.append(content);
};

FriendlyEats.prototype.rerender = function () {
    this.router.navigate(document.location.pathname + '?' + new Date().getTime());
};

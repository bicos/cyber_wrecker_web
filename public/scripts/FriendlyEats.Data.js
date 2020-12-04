'use strict';

FriendlyEats.prototype.getAllDocs = function (renderer) {
    var query = firebase.firestore()
        .collection('docs_v2')
        .orderBy('createdAt', 'desc')
        .limit(50);

    this.getDocumentsInQuery(query, renderer);
};

FriendlyEats.prototype.getDocumentsInQuery = function (query, renderer) {
    query.onSnapshot(function (snapshot) {
        if (!snapshot.size) {
            return renderer.empty();
        }

        snapshot.docChanges().forEach(function (change) {
            if (change.type === 'removed') {
                renderer.remove(change.doc);
            } else {
                renderer.display(change.doc);
            }
        });
    });
};

FriendlyEats.prototype.getDoc = function (id) {
    return firebase.firestore().collection('docs_v2').doc(id).get();
};

FriendlyEats.prototype.getFilteredDocs = function (filters, renderer) {
    var query = firebase.firestore().collection('docs_v2');

    // if (filters.cp !== 'Any') {
    //     query = query.where('cp', '==', filters.cp);
    // }

    this.getDocumentsInQuery(query, renderer);
};

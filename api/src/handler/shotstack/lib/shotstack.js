'use strict';

const axios = require('axios').default;
const shotstackUrl = 'https://api.shotstack.io/stage/';
const shotstackApiKey = 'gicRtWGXQClTaqwJOWrWXWLsxI5HXAd7iTZHRfCl';

const submit = (json) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'post',
            url: shotstackUrl + 'render',
            headers: {
                'x-api-key': shotstackApiKey,
                'content-type': 'application/json'            
            },
            data: json
        })
        .then((response) => {
            return resolve(response.data)
        }, (error) => {
            return reject(error)
        });
    })
}

const status = (id) => {
    return new Promise((resolve, reject) => {
        axios({
            method: 'get',
            url: shotstackUrl + 'render/' + id,
            headers: {
                'x-api-key': shotstackApiKey
            }
        })
        .then((response) => {
            return resolve(response.data.response);
        }), (error) => {
            return reject(error);
        }
    })
}

module.exports = {
    submit,
    status
}

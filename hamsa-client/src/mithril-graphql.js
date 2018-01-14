/**
 * Mithril GraphQL Tiny Client for the Browser
 * Inspired (as in cloned line by line) from https://github.com/benthepoet/mithril-graphql
 * 
 * @param {*} options 
 */

import m from "mithril";

export const mql = function (options) {
    return {
        merge: function () {
            var target = {}

            for (let source of arguments) {
                for (let prop in source) {
                    target[prop] = source[prop]
                }
            }
            return target
        },
        minify: function (query) {
            return query.replace(/[\r\n][\t\s]+/g, ' ')
        },
        get: function(query, variables) {
            return this.request("GET", query, JSON.stringify(variables))
        },
        post: function(query, variables) {
            return this.request("POST", query, JSON.stringify(variables))            
        },
        request: function(method, query, variables) {
            let opts = this.merge(options, {
                data: {
                    query: this.minify(query),
                    variables: variables
                },
                method: method
            })

            return m.request(opts)
        }
    }
}
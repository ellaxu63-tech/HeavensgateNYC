/*
 * A tiny shared store. Replaces Framer's `createStore`: the home page physics,
 * the PAUSE / RESUME button and the navigation all read and write this.
 *
 *   paused         – motion is paused (PAUSE button)
 *   projectActive  – a project card is hovered / focused (the nav fades out)
 */
(function () {
    'use strict'

    var HG = (window.HG = window.HG || {})

    HG.createStore = function (initial) {
        var state = Object.assign({}, initial)
        var subscribers = []

        return {
            get: function () {
                return state
            },
            set: function (patch) {
                var changed = Object.keys(patch).some(function (key) {
                    return state[key] !== patch[key]
                })
                if (!changed) return
                state = Object.assign({}, state, patch)
                subscribers.slice().forEach(function (fn) {
                    fn(state)
                })
            },
            // Calls fn immediately with the current state, then on every change.
            subscribe: function (fn) {
                subscribers.push(fn)
                fn(state)
                return function () {
                    subscribers = subscribers.filter(function (s) {
                        return s !== fn
                    })
                }
            },
        }
    }

    HG.motion = HG.createStore({ paused: false, projectActive: false })
})()

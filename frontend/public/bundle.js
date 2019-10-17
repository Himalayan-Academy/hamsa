
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\Header.svelte generated by Svelte v3.12.1 */

    const file = "src\\Header.svelte";

    function create_fragment(ctx) {
    	var div2, header, a0, img0, t0, div1, h1, t2, h2, t4, div0, t5, a1, img1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			header = element("header");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Himalayan Academy";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Museum of Spiritual Arts";
    			t4 = space();
    			div0 = element("div");
    			t5 = space();
    			a1 = element("a");
    			img1 = element("img");
    			attr_dev(img0, "src", "images/hamsa-logo-opt.jpg");
    			attr_dev(img0, "alt", "HAMSA logo");
    			attr_dev(img0, "class", "hamsa-logo svelte-elyn56");
    			add_location(img0, file, 26, 12, 500);
    			attr_dev(a0, "href", "/hamsa");
    			attr_dev(a0, "class", "logo svelte-elyn56");
    			add_location(a0, file, 25, 8, 456);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file, 29, 12, 646);
    			attr_dev(h2, "class", "subtitle");
    			add_location(h2, file, 30, 12, 700);
    			set_style(div0, "flex", "auto");
    			add_location(div0, file, 31, 12, 764);
    			attr_dev(div1, "class", "monastery-header-text");
    			add_location(div1, file, 28, 8, 597);
    			attr_dev(img1, "class", "monastery-logo svelte-elyn56");
    			attr_dev(img1, "src", "images/monastery-logo.png");
    			attr_dev(img1, "alt", "Monastery Logo");
    			add_location(img1, file, 34, 12, 869);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "monastery-logo svelte-elyn56");
    			add_location(a1, file, 33, 8, 820);
    			add_location(header, file, 24, 4, 438);
    			add_location(div2, file, 23, 0, 427);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, header);
    			append_dev(header, a0);
    			append_dev(a0, img0);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t2);
    			append_dev(div1, h2);
    			append_dev(div1, t4);
    			append_dev(div1, div0);
    			append_dev(header, t5);
    			append_dev(header, a1);
    			append_dev(a1, img1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment.name });
    	}
    }

    /* src\Hero.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\Hero.svelte";

    function create_fragment$1(ctx) {
    	var div1, div0, figure0, img0, t, figure1, img1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			figure0 = element("figure");
    			img0 = element("img");
    			t = space();
    			figure1 = element("figure");
    			img1 = element("img");
    			attr_dev(img0, "src", "images/hero2.jpg");
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "hero svelte-nxvt8o");
    			add_location(img0, file$1, 34, 30, 624);
    			attr_dev(figure0, "class", "hero1 svelte-nxvt8o");
    			add_location(figure0, file$1, 34, 8, 602);
    			attr_dev(img1, "src", "images/hero1.jpg");
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$1, 35, 35, 718);
    			attr_dev(figure1, "class", "hero2 fade svelte-nxvt8o");
    			add_location(figure1, file$1, 35, 8, 691);
    			attr_dev(div0, "class", "hero svelte-nxvt8o");
    			add_location(div0, file$1, 33, 4, 574);
    			add_location(div1, file$1, 32, 0, 563);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, figure0);
    			append_dev(figure0, img0);
    			append_dev(div0, t);
    			append_dev(div0, figure1);
    			append_dev(figure1, img1);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Hero", options, id: create_fragment$1.name });
    	}
    }

    /* src\SelectorButton.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$2 = "src\\SelectorButton.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (62:4) {#each items as item}
    function create_each_block(ctx) {
    	var li, t_value = ctx.item + "", t, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			t = text(t_value);
    			attr_dev(li, "class", "list-item svelte-15hgir4");
    			add_location(li, file$2, 62, 8, 1413);
    			dispose = listen_dev(li, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.items) && t_value !== (t_value = ctx.item + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(li);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(62:4) {#each items as item}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div1, div0, span, t0, t1, i, t2, ul, dispose;

    	let each_value = ctx.items;

    	let each_blocks = [];

    	for (let i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block(get_each_context(ctx, each_value, i_1));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(ctx.title);
    			t1 = space();
    			i = element("i");
    			t2 = space();
    			ul = element("ul");

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}
    			attr_dev(span, "class", "title");
    			add_location(span, file$2, 57, 8, 1242);
    			attr_dev(i, "class", "fa fa-caret-down");
    			add_location(i, file$2, 58, 8, 1286);
    			attr_dev(div0, "class", "selector-text svelte-15hgir4");
    			add_location(div0, file$2, 56, 4, 1205);
    			attr_dev(ul, "class", "selector-content svelte-15hgir4");
    			toggle_class(ul, "open", ctx.open);
    			add_location(ul, file$2, 60, 4, 1336);
    			attr_dev(div1, "class", "round-wrapper is-selector-categories svelte-15hgir4");
    			add_location(div1, file$2, 55, 0, 1119);
    			dispose = listen_dev(div1, "click", ctx.click_handler_1);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div0, t1);
    			append_dev(div0, i);
    			append_dev(div1, t2);
    			append_dev(div1, ul);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(ul, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.title) {
    				set_data_dev(t0, ctx.title);
    			}

    			if (changed.items) {
    				each_value = ctx.items;

    				let i_1;
    				for (i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(ul, null);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (changed.open) {
    				toggle_class(ul, "open", ctx.open);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { title="untitled", items=[] } = $$props;

        let open = false;

        const onClick = (item) => {
            console.log("clicked", item);
        };

    	const writable_props = ['title', 'items'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<SelectorButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ({ item }) => {onClick(item);};

    	const click_handler_1 = () => $$invalidate('open', open = !open);

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    	};

    	$$self.$capture_state = () => {
    		return { title, items, open };
    	};

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    	};

    	return {
    		title,
    		items,
    		open,
    		onClick,
    		click_handler,
    		click_handler_1
    	};
    }

    class SelectorButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment$2, safe_not_equal, ["title", "items"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SelectorButton", options, id: create_fragment$2.name });
    	}

    	get title() {
    		throw new Error("<SelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<SelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get items() {
    		throw new Error("<SelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set items(value) {
    		throw new Error("<SelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SearchField.svelte generated by Svelte v3.12.1 */

    const file$3 = "src\\SearchField.svelte";

    function create_fragment$3(ctx) {
    	var div, input, t, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			i = element("i");
    			attr_dev(input, "class", "search svelte-1pmgsh7");
    			attr_dev(input, "placeholder", "Search");
    			add_location(input, file$3, 26, 4, 597);
    			attr_dev(i, "class", "fa fa-search");
    			add_location(i, file$3, 27, 4, 646);
    			attr_dev(div, "class", "round-wrapper is-search-box svelte-1pmgsh7");
    			add_location(div, file$3, 25, 0, 550);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			append_dev(div, i);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    class SearchField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SearchField", options, id: create_fragment$3.name });
    	}
    }

    var nanographql_1 = nanographql;

    var getOpname = /(query|mutation) ?([\w\d-_]+)? ?\(.*?\)? \{/;

    function nanographql (str) {
      str = Array.isArray(str) ? str.join('') : str;
      var name = getOpname.exec(str);
      return function (variables) {
        var data = { query: str };
        if (variables) data.variables = JSON.stringify(variables);
        if (name && name.length) {
          var operationName = name[2];
          if (operationName) data.operationName = name[2];
        }
        return JSON.stringify(data)
      }
    }

    const API_URL = "http://dev.himalayanacademy.com/hamsa/api/index.php";


    const getSelectors = async () => {
        let query = nanographql_1`
      query {
        collections
        artists
        keywords
      }
    `;

        return executeQuery(query);
    };

    const getCollection = async (payload) => {
        let query = nanographql_1`
      query($limit: Int!, $offset: Int!) 
        { 
            images( limit: $limit offset: $offset ) 
                { 
                thumbnail, 
                checksum 
                } 
        } 
    `;

        return executeQuery(query, payload);
    };

    const executeQuery = async (query, payload) => {
        try {
            const res = await fetch(API_URL, {
                body: query(payload),
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const json = await res.json();
            return (json.data);
        } catch (err) {
            console.error(`GraphQL Error`, err);
            throw err;
        }
    };

    /* src\SelectorControls.svelte generated by Svelte v3.12.1 */

    const file$4 = "src\\SelectorControls.svelte";

    function create_fragment$4(ctx) {
    	var div1, div0, span, t1, t2, t3, t4, current;

    	var selectorbutton0 = new SelectorButton({
    		props: { title: "Tags", items: ctx.keywordList },
    		$$inline: true
    	});

    	var selectorbutton1 = new SelectorButton({
    		props: { title: "Artists", items: ctx.artistsList },
    		$$inline: true
    	});

    	var selectorbutton2 = new SelectorButton({
    		props: {
    		title: "Collections",
    		items: ctx.collectionList
    	},
    		$$inline: true
    	});

    	var searchfield = new SearchField({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "i";
    			t1 = space();
    			selectorbutton0.$$.fragment.c();
    			t2 = space();
    			selectorbutton1.$$.fragment.c();
    			t3 = space();
    			selectorbutton2.$$.fragment.c();
    			t4 = space();
    			searchfield.$$.fragment.c();
    			add_location(span, file$4, 51, 27, 1313);
    			attr_dev(div0, "class", "bolotinha svelte-1i2gr6c");
    			add_location(div0, file$4, 51, 4, 1290);
    			attr_dev(div1, "class", "selector-controls svelte-1i2gr6c");
    			add_location(div1, file$4, 50, 0, 1253);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(div1, t1);
    			mount_component(selectorbutton0, div1, null);
    			append_dev(div1, t2);
    			mount_component(selectorbutton1, div1, null);
    			append_dev(div1, t3);
    			mount_component(selectorbutton2, div1, null);
    			append_dev(div1, t4);
    			mount_component(searchfield, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var selectorbutton0_changes = {};
    			if (changed.keywordList) selectorbutton0_changes.items = ctx.keywordList;
    			selectorbutton0.$set(selectorbutton0_changes);

    			var selectorbutton1_changes = {};
    			if (changed.artistsList) selectorbutton1_changes.items = ctx.artistsList;
    			selectorbutton1.$set(selectorbutton1_changes);

    			var selectorbutton2_changes = {};
    			if (changed.collectionList) selectorbutton2_changes.items = ctx.collectionList;
    			selectorbutton2.$set(selectorbutton2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(selectorbutton0.$$.fragment, local);

    			transition_in(selectorbutton1.$$.fragment, local);

    			transition_in(selectorbutton2.$$.fragment, local);

    			transition_in(searchfield.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(selectorbutton0.$$.fragment, local);
    			transition_out(selectorbutton1.$$.fragment, local);
    			transition_out(selectorbutton2.$$.fragment, local);
    			transition_out(searchfield.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			destroy_component(selectorbutton0);

    			destroy_component(selectorbutton1);

    			destroy_component(selectorbutton2);

    			destroy_component(searchfield);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	

        let artistsList = [];
        let collectionList = [];
        let keywordList = [];

        onMount(async () => {
            let selectors = await getSelectors();
            $$invalidate('artistsList', artistsList = selectors.artists.sort());
            $$invalidate('collectionList', collectionList  = selectors.collections.sort());
            $$invalidate('keywordList', keywordList = selectors.keywords.sort());

            console.log("selectors data", selectors);


        });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('artistsList' in $$props) $$invalidate('artistsList', artistsList = $$props.artistsList);
    		if ('collectionList' in $$props) $$invalidate('collectionList', collectionList = $$props.collectionList);
    		if ('keywordList' in $$props) $$invalidate('keywordList', keywordList = $$props.keywordList);
    	};

    	return { artistsList, collectionList, keywordList };
    }

    class SelectorControls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SelectorControls", options, id: create_fragment$4.name });
    	}
    }

    /* src\InfoPage.svelte generated by Svelte v3.12.1 */

    const file$5 = "src\\InfoPage.svelte";

    function create_fragment$5(ctx) {
    	var div1, div0, h1, t1, p0, t3, p1, t4, a, t6, t7, button;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to HAMSA";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Indian spiritual art has no equal in the world, either in scope or sheer quantity. For five decades the monks\r\n            at Kauai’s Hindu Monastery in Hawaii have been commissioning and collecting original works of art for our\r\n            many publications, apps and web projects. Among the thousands of images you will find rare masterpieces,\r\n            educational depictions of Hindu culture, legend, deities and philosophy, sacred religious symbols,\r\n            illustrated alphabets, children’s stories and decorative borders. For decades this treasure trove was hidden\r\n            in the binary recesses of our server (even we could barely find things). Now the entire collection is\r\n            available to you through the Himalayan Academy Museum of Spiritual Art. In Sanskrit hamsa is the word for\r\n            the Indian Goose (Anser indicus) or a swan, and represents the Ultimate Reality and the spiritually pure\r\n            soul. The flight of the hamsa symbolizes moksha, the release from the cycle of samsara.";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("You can search by key word, artist or collection. The download button will save the highest available\r\n            resolution file to your computer. You may use these images freely in service to dharma. However, if your use\r\n            is commercial, you must get written permission from the copyright holder, Himalayan Academy, by writing to:\r\n            ");
    			a = element("a");
    			a.textContent = "contact@hindu.org";
    			t6 = text(".");
    			t7 = space();
    			button = element("button");
    			button.textContent = "Go back";
    			attr_dev(h1, "id", "welcome-to-hamsa");
    			add_location(h1, file$5, 20, 9, 421);
    			add_location(p0, file$5, 21, 8, 478);
    			attr_dev(a, "href", "mailto:contact@hindu.org");
    			add_location(a, file$5, 33, 12, 1889);
    			add_location(p1, file$5, 30, 8, 1528);
    			add_location(div0, file$5, 20, 4, 416);
    			attr_dev(button, "class", "back-button svelte-5zgyg");
    			add_location(button, file$5, 35, 4, 1968);
    			attr_dev(div1, "class", "info info-blurb svelte-5zgyg");
    			add_location(div1, file$5, 19, 0, 381);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a);
    			append_dev(p1, t6);
    			append_dev(div1, t7);
    			append_dev(div1, button);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class InfoPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "InfoPage", options, id: create_fragment$5.name });
    	}
    }

    /* src\Collection.svelte generated by Svelte v3.12.1 */

    const file$6 = "src\\Collection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (82:2) {:else}
    function create_else_block(ctx) {
    	var t0, div1, div0, t1, section;

    	var if_block = (ctx.name !== "home") && create_if_block_1(ctx);

    	let each_value = ctx.collection;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    		each_1_else.c();
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t1 = space();
    			section = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "collection-inner svelte-6a0lcj");
    			add_location(div0, file$6, 89, 2, 1907);
    			attr_dev(section, "class", "g svelte-6a0lcj");
    			add_location(section, file$6, 90, 2, 1947);
    			attr_dev(div1, "class", "collection");
    			add_location(div1, file$6, 88, 0, 1879);
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			append_dev(div1, section);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(section, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (ctx.name !== "home") {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.thumbnailToURL || changed.collection || changed.name) {
    				each_value = ctx.collection;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(section, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (!each_value.length && each_1_else) {
    				each_1_else.p(changed, ctx);
    			} else if (!each_value.length) {
    				each_1_else = create_else_block_1(ctx);
    				each_1_else.c();
    				each_1_else.m(section, null);
    			} else if (each_1_else) {
    				each_1_else.d(1);
    				each_1_else = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t0);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (each_1_else) each_1_else.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(82:2) {:else}", ctx });
    	return block;
    }

    // (78:2) {#if collection.length == 0}
    function create_if_block(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$6, 79, 6, 1635);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$6, 78, 2, 1598);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(78:2) {#if collection.length == 0}", ctx });
    	return block;
    }

    // (83:2) {#if name !== "home"}
    function create_if_block_1(ctx) {
    	var div, h3, t0, t1, p, t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(ctx.name);
    			t1 = space();
    			p = element("p");
    			t2 = text(description);
    			attr_dev(h3, "class", "collection-title svelte-6a0lcj");
    			add_location(h3, file$6, 84, 4, 1765);
    			attr_dev(p, "class", "collection-description svelte-6a0lcj");
    			add_location(p, file$6, 85, 4, 1811);
    			attr_dev(div, "class", "collection-header svelte-6a0lcj");
    			add_location(div, file$6, 83, 2, 1728);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.name) {
    				set_data_dev(t0, ctx.name);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(83:2) {#if name !== \"home\"}", ctx });
    	return block;
    }

    // (96:4) {:else}
    function create_else_block_1(ctx) {
    	var p, t0, t1, t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Sorry but we couldn't find images related to ");
    			t1 = text(ctx.name);
    			t2 = text(".\r\n    ");
    			attr_dev(p, "class", "no-collection svelte-6a0lcj");
    			add_location(p, file$6, 96, 4, 2129);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.name) {
    				set_data_dev(t1, ctx.name);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1.name, type: "else", source: "(96:4) {:else}", ctx });
    	return block;
    }

    // (92:4) {#each collection as item}
    function create_each_block$1(ctx) {
    	var div, figure, img, img_src_value, t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			attr_dev(img, "src", img_src_value = ctx.thumbnailToURL(ctx.item.thumbnail));
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-6a0lcj");
    			add_location(img, file$6, 93, 16, 2038);
    			attr_dev(figure, "class", "svelte-6a0lcj");
    			add_location(figure, file$6, 93, 8, 2030);
    			attr_dev(div, "class", "gi svelte-6a0lcj");
    			add_location(div, file$6, 92, 4, 2004);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, figure);
    			append_dev(figure, img);
    			append_dev(div, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.collection) && img_src_value !== (img_src_value = ctx.thumbnailToURL(ctx.item.thumbnail))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(92:4) {#each collection as item}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div;

    	function select_block_type(changed, ctx) {
    		if (ctx.collection.length == 0) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$6, 76, 0, 1557);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if_block.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    let description = "";

    let offset = 0;

    let IMAGE_URL = "http://dev.himalayanacademy.com/hamsa-images";

    function instance$2($$self, $$props, $$invalidate) {
    	

        let { name = "home" } = $$props;
        let collection = [];

        onMount( async () => {
            let {images} = await getCollection({limit: 50, offset});
            $$invalidate('collection', collection = images);
            await tick();
            up();
        });

        const thumbnailToURL = (t) => {
            let i = t.replace("/images/", "");
            return `${IMAGE_URL}/${i}`;
        };

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Collection> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	$$self.$capture_state = () => {
    		return { name, description, offset, IMAGE_URL, collection };
    	};

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('offset' in $$props) offset = $$props.offset;
    		if ('IMAGE_URL' in $$props) IMAGE_URL = $$props.IMAGE_URL;
    		if ('collection' in $$props) $$invalidate('collection', collection = $$props.collection);
    	};

    	return { name, collection, thumbnailToURL };
    }

    class Collection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$6, safe_not_equal, ["name"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Collection", options, id: create_fragment$6.name });
    	}

    	get name() {
    		throw new Error("<Collection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Collection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    const file$7 = "src\\App.svelte";

    function create_fragment$7(ctx) {
    	var div, t0, t1, t2, current;

    	var header = new Header({ $$inline: true });

    	var hero = new Hero({ $$inline: true });

    	var selectorcontrols = new SelectorControls({ $$inline: true });

    	var switch_value = ctx.views[currentView];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			header.$$.fragment.c();
    			t0 = space();
    			hero.$$.fragment.c();
    			t1 = space();
    			selectorcontrols.$$.fragment.c();
    			t2 = space();
    			if (switch_instance) switch_instance.$$.fragment.c();
    			add_location(div, file$7, 15, 0, 348);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			mount_component(hero, div, null);
    			append_dev(div, t1);
    			mount_component(selectorcontrols, div, null);
    			append_dev(div, t2);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (switch_value !== (switch_value = ctx.views[currentView])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			transition_in(hero.$$.fragment, local);

    			transition_in(selectorcontrols.$$.fragment, local);

    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(hero.$$.fragment, local);
    			transition_out(selectorcontrols.$$.fragment, local);
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_component(header);

    			destroy_component(hero);

    			destroy_component(selectorcontrols);

    			if (switch_instance) destroy_component(switch_instance);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    let currentView = "Collection";

    function instance$3($$self) {
    	

    	const views = {
    		"InfoPage": InfoPage,
    		"Collection": Collection
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentView' in $$props) $$invalidate('currentView', currentView = $$props.currentView);
    	};

    	return { views };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$7.name });
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

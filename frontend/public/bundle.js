
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
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
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
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = current_component;
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const API_URL = "https://dev.himalayanacademy.com/hamsa/api/index.php";

    const checkLogin = () => {
      if (
        sessionStorage.getItem("email") !== null &&
        sessionStorage.getItem("password") !== null
      ) {
        return true;
      } else {
        return false;
      }
    };

    const loggedIn = writable(checkLogin());

    const login = async (email, password) => {
      let query = nanographql_1`
    query($email: String, $password: String) {
      login(email: $email, password: $password)
    }
  `;
      let res = await executeQuery(query, { email, password });
      return res && res.login === "ok";
    };

    const removeImageTag = async (email, password, checksum, tag) => {
      let mutation = nanographql_1`
    mutation(
      $email: String
      $password: String
      $checksum: String
      $tag: String
    ) {
      removeImageTag(
        email: $email
        password: $password
        checksum: $checksum
        tag: $tag
      ) {
        checksum
        path
        medpath
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
    }
  `;
      return executeQuery(mutation, { email, password, checksum, tag });
    };

    const addImageTag = async (email, password, checksum, tag) => {
      let mutation = nanographql_1`
    mutation(
      $email: String
      $password: String
      $checksum: String
      $tag: String
    ) {
      addImageTag(
        email: $email
        password: $password
        checksum: $checksum
        tag: $tag
      ) {
        checksum
        path
        medpath
        thumbnail
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
    }
  `;
      return executeQuery(mutation, { email, password, checksum, tag });
    };

    const setImageDescription = async (
      email,
      password,
      checksum,
      description
    ) => {
      let mutation = nanographql_1`
    mutation(
      $email: String
      $password: String
      $checksum: String
      $description: String
    ) {
      setImageDescription(
        email: $email
        password: $password
        checksum: $checksum
        description: $description
      ) {
        checksum
        path
        medpath
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
    }
  `;
      return executeQuery(mutation, { email, password, checksum, description });
    };

    const setImageNotes = async (email, password, checksum, notes) => {
      let mutation = nanographql_1`
    mutation(
      $email: String
      $password: String
      $checksum: String
      $notes: String
    ) {
      setImageNotes(
        email: $email
        password: $password
        checksum: $checksum
        notes: $notes
      ) {
        checksum
        path
        medpath
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
    }
  `;
      return executeQuery(mutation, {
        email,
        password,
        checksum,
        notes: notes
      });
    };

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

    const getCollection = async payload => {
      let query = nanographql_1`
    query(
      $limit: Int!
      $offset: Int!
      $keyword: String
      $artist: String
      $query: String
    ) {
      images(
        limit: $limit
        offset: $offset
        keyword: $keyword
        artist: $artist
        query: $query
      ) {
        thumbnail
        checksum
      }
    }
  `;

      return executeQuery(query, payload);
    };

    const getImage = async payload => {
      let query = nanographql_1`
    query($checksum: String!) {
      image(checksum: $checksum) {
        checksum
        path
        medpath
        thumbnail
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
    }
  `;

      return executeQuery(query, payload);
    };

    const getImagesForCollectionEditor = async images => {
      let fragments = images.map((checksum, index) => {
          return `i${index}: image(checksum: "${checksum}") {
        checksum
        path
        medpath
        thumbnail
        width
        height
        metadata {
          artist
          description
          notes
          more
          keywords
        }
      }
  `}).join("\n");

      let query = `
  query{
    ${fragments}
  }`;

      return executeQuery(nanographql_1(query), {});
    };

    const executeQuery = async (query, payload) => {
      try {
        const res = await fetch(API_URL, {
          body: query(payload),
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        });
        const json = await res.json();
        if (json.data) {
          return json.data;
        } else {
          console.error(`GraphQL Error`, json.errors);
          throw json.errors;
        }
      } catch (err) {
        console.error(`GraphQL Error`, err);
        throw err;
      }
    };

    /* src\LoginDialog.svelte generated by Svelte v3.12.1 */

    const file = "src\\LoginDialog.svelte";

    // (99:6) {:else}
    function create_else_block(ctx) {
    	var button, dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "log out";
    			add_location(button, file, 99, 12, 2357);
    			dispose = listen_dev(button, "click", ctx.logout);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(button);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(99:6) {:else}", ctx });
    	return block;
    }

    // (88:6) {#if !$loggedIn}
    function create_if_block(ctx) {
    	var h1, t1, t2, label0, t4, input0, t5, label1, t7, input1, t8, br, t9, input2, dispose;

    	var if_block = (ctx.error) && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Login";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Email:";
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Password:";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			br = element("br");
    			t9 = space();
    			input2 = element("input");
    			add_location(h1, file, 88, 6, 1985);
    			attr_dev(label0, "for", "email");
    			add_location(label0, file, 92, 6, 2067);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "email");
    			add_location(input0, file, 93, 6, 2107);
    			attr_dev(label1, "for", "password");
    			add_location(label1, file, 94, 6, 2165);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			add_location(input1, file, 95, 6, 2211);
    			add_location(br, file, 96, 6, 2279);
    			attr_dev(input2, "type", "submit");
    			input2.value = "log in";
    			add_location(input2, file, 97, 6, 2292);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, label0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, input0, anchor);

    			set_input_value(input0, ctx.email);

    			insert_dev(target, t5, anchor);
    			insert_dev(target, label1, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, input1, anchor);

    			set_input_value(input1, ctx.password);

    			insert_dev(target, t8, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, input2, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.error) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(t2.parentNode, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (changed.email && (input0.value !== ctx.email)) set_input_value(input0, ctx.email);
    			if (changed.password && (input1.value !== ctx.password)) set_input_value(input1, ctx.password);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    				detach_dev(t1);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    				detach_dev(label0);
    				detach_dev(t4);
    				detach_dev(input0);
    				detach_dev(t5);
    				detach_dev(label1);
    				detach_dev(t7);
    				detach_dev(input1);
    				detach_dev(t8);
    				detach_dev(br);
    				detach_dev(t9);
    				detach_dev(input2);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(88:6) {#if !$loggedIn}", ctx });
    	return block;
    }

    // (90:6) {#if error}
    function create_if_block_1(ctx) {
    	var p, t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(ctx.error);
    			attr_dev(p, "class", "error svelte-in19y4");
    			add_location(p, file, 90, 6, 2024);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.error) {
    				set_data_dev(t, ctx.error);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(90:6) {#if error}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div1, div0, form, dispose;

    	function select_block_type(changed, ctx) {
    		if (!ctx.$loggedIn) return create_if_block;
    		return create_else_block;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			form = element("form");
    			if_block.c();
    			attr_dev(form, "class", "svelte-in19y4");
    			add_location(form, file, 86, 4, 1905);
    			attr_dev(div0, "class", "login-dialog svelte-in19y4");
    			add_location(div0, file, 85, 2, 1840);
    			attr_dev(div1, "class", "login-dialog-wrapper svelte-in19y4");
    			add_location(div1, file, 84, 0, 1803);

    			dispose = [
    				listen_dev(form, "submit", prevent_default(ctx.testAndSaveLogin), false, true),
    				listen_dev(div0, "click", stop_propagation(click_handler), false, false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, form);
    			if_block.m(form, null);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(form, null);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    const click_handler = () => {};

    function instance($$self, $$props, $$invalidate) {
    	let $loggedIn;

    	validate_store(loggedIn, 'loggedIn');
    	component_subscribe($$self, loggedIn, $$value => { $loggedIn = $$value; $$invalidate('$loggedIn', $loggedIn); });

    	

    	const dispatch = createEventDispatcher();

      let email;
      let password;
      let error = false;

      const savedCredentials = () => {
        if (
          sessionStorage.getItem("email") !== null &&
          sessionStorage.getItem("password") !== null
        ) {
          $$invalidate('email', email = sessionStorage.getItem("email"));
          $$invalidate('password', password = sessionStorage.getItem("password"));
          return true;
        } else {
          return false;
        }
      };

    const logout = async () => {
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("password");
        set_store_value(loggedIn, $loggedIn = false);
        dispatch('loggedOut');
    };

      const testAndSaveLogin = async () => {
        if (await login(email, password)) {
          console.log(`user ${email} logged in.`);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("password", password);
          $$invalidate('error', error = false);
          set_store_value(loggedIn, $loggedIn = true);
          dispatch('loggedIn', email);
        } else {
          console.log(`Bad login credentials.`);
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("password");
          $$invalidate('error', error = "Not a valid user.");
          set_store_value(loggedIn, $loggedIn = false);
        }
      };

      set_store_value(loggedIn, $loggedIn = savedCredentials());

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate('email', email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('email' in $$props) $$invalidate('email', email = $$props.email);
    		if ('password' in $$props) $$invalidate('password', password = $$props.password);
    		if ('error' in $$props) $$invalidate('error', error = $$props.error);
    		if ('$loggedIn' in $$props) loggedIn.set($loggedIn);
    	};

    	return {
    		email,
    		password,
    		error,
    		logout,
    		testAndSaveLogin,
    		$loggedIn,
    		input0_input_handler,
    		input1_input_handler
    	};
    }

    class LoginDialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "LoginDialog", options, id: create_fragment.name });
    	}
    }

    /* src\Header.svelte generated by Svelte v3.12.1 */

    const file$1 = "src\\Header.svelte";

    // (72:6) {:else}
    function create_else_block$1(ctx) {
    	var span, t_value = sessionStorage.getItem("email") + "", t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "svelte-1ahide6");
    			add_location(span, file$1, 72, 6, 1475);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$1.name, type: "else", source: "(72:6) {:else}", ctx });
    	return block;
    }

    // (70:6) {#if !$loggedIn}
    function create_if_block_1$1(ctx) {
    	var span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "ॐ";
    			attr_dev(span, "class", "svelte-1ahide6");
    			add_location(span, file$1, 70, 6, 1438);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(70:6) {#if !$loggedIn}", ctx });
    	return block;
    }

    // (75:6) {#if dialogOpen}
    function create_if_block$1(ctx) {
    	var current;

    	var logindialog = new LoginDialog({ $$inline: true });
    	logindialog.$on("loggedIn", ctx.loggedIn_handler);
    	logindialog.$on("loggedOut", ctx.loggedOut_handler);

    	const block = {
    		c: function create() {
    			logindialog.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(logindialog, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(logindialog.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(logindialog.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(logindialog, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(75:6) {#if dialogOpen}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var div3, header, a0, img0, t0, div1, h1, t2, h2, t4, div0, t5, a1, img1, t6, div2, t7, current, dispose;

    	function select_block_type(changed, ctx) {
    		if (!ctx.$loggedIn) return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block0 = current_block_type(ctx);

    	var if_block1 = (ctx.dialogOpen) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			header = element("header");
    			a0 = element("a");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Himalayan Academy";
    			t2 = space();
    			h2 = element("h2");
    			h2.textContent = "Museum of Spiritual Art";
    			t4 = space();
    			div0 = element("div");
    			t5 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t6 = space();
    			div2 = element("div");
    			if_block0.c();
    			t7 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(img0, "src", "images/hamsa-logo-opt.jpg");
    			attr_dev(img0, "alt", "HAMSA logo");
    			attr_dev(img0, "class", "hamsa-logo svelte-1ahide6");
    			add_location(img0, file$1, 48, 6, 827);
    			attr_dev(a0, "href", "/hamsa");
    			attr_dev(a0, "class", "logo svelte-1ahide6");
    			add_location(a0, file$1, 47, 4, 789);
    			attr_dev(h1, "class", "title");
    			add_location(h1, file$1, 54, 6, 988);
    			attr_dev(h2, "class", "subtitle");
    			add_location(h2, file$1, 55, 6, 1036);
    			set_style(div0, "flex", "auto");
    			add_location(div0, file$1, 56, 6, 1093);
    			attr_dev(div1, "class", "monastery-header-text");
    			add_location(div1, file$1, 53, 4, 945);
    			attr_dev(img1, "class", "monastery-logo svelte-1ahide6");
    			attr_dev(img1, "src", "images/monastery-logo.png");
    			attr_dev(img1, "alt", "Monastery Logo");
    			add_location(img1, file$1, 59, 6, 1180);
    			attr_dev(a1, "href", "/");
    			attr_dev(a1, "class", "monastery-logo svelte-1ahide6");
    			add_location(a1, file$1, 58, 4, 1137);
    			attr_dev(div2, "class", "aum-glyph svelte-1ahide6");
    			add_location(div2, file$1, 64, 4, 1306);
    			add_location(header, file$1, 46, 2, 775);
    			add_location(div3, file$1, 45, 0, 766);
    			dispose = listen_dev(div2, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, header);
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
    			append_dev(header, t6);
    			append_dev(header, div2);
    			if_block0.m(div2, null);
    			append_dev(div2, t7);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type !== (current_block_type = select_block_type(changed, ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div2, t7);
    				}
    			}

    			if (ctx.dialogOpen) {
    				if (!if_block1) {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				} else transition_in(if_block1, 1);
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if_block0.d();
    			if (if_block1) if_block1.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $loggedIn;

    	validate_store(loggedIn, 'loggedIn');
    	component_subscribe($$self, loggedIn, $$value => { $loggedIn = $$value; $$invalidate('$loggedIn', $loggedIn); });

    	

    let dialogOpen = false;
    let email = false;

    	const loggedIn_handler = (ev) => {
    	          console.log("received logged in event");
    	          $$invalidate('dialogOpen', dialogOpen = false);
    	          $$invalidate('email', email = ev.detail);
    	      };

    	const loggedOut_handler = (ev) => {
    	          console.log("received log out event");
    	          $$invalidate('dialogOpen', dialogOpen = false);
    	          $$invalidate('email', email = false);
    	      };

    	const click_handler = () => {
    	        $$invalidate('dialogOpen', dialogOpen = !dialogOpen);
    	      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('dialogOpen' in $$props) $$invalidate('dialogOpen', dialogOpen = $$props.dialogOpen);
    		if ('email' in $$props) $$invalidate('email', email = $$props.email);
    		if ('$loggedIn' in $$props) loggedIn.set($loggedIn);
    	};

    	return {
    		dialogOpen,
    		email,
    		$loggedIn,
    		loggedIn_handler,
    		loggedOut_handler,
    		click_handler
    	};
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment$1.name });
    	}
    }

    /* src\Hero.svelte generated by Svelte v3.12.1 */

    const file$2 = "src\\Hero.svelte";

    function create_fragment$2(ctx) {
    	var div1, div0, figure0, t, figure1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			figure0 = element("figure");
    			t = space();
    			figure1 = element("figure");
    			attr_dev(figure0, "class", "hero1 svelte-x1o1yg");
    			add_location(figure0, file$2, 41, 4, 829);
    			attr_dev(figure1, "class", "hero2 svelte-x1o1yg");
    			add_location(figure1, file$2, 42, 4, 859);
    			attr_dev(div0, "class", "hero svelte-x1o1yg");
    			add_location(div0, file$2, 40, 2, 805);
    			add_location(div1, file$2, 39, 0, 796);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, figure0);
    			append_dev(div0, t);
    			append_dev(div0, figure1);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Hero", options, id: create_fragment$2.name });
    	}
    }

    var strictUriEncode = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

    var token = '%[a-f0-9]{2}';
    var singleMatcher = new RegExp(token, 'gi');
    var multiMatcher = new RegExp('(' + token + ')+', 'gi');

    function decodeComponents(components, split) {
    	try {
    		// Try to decode the entire string first
    		return decodeURIComponent(components.join(''));
    	} catch (err) {
    		// Do nothing
    	}

    	if (components.length === 1) {
    		return components;
    	}

    	split = split || 1;

    	// Split the array in 2 parts
    	var left = components.slice(0, split);
    	var right = components.slice(split);

    	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
    }

    function decode(input) {
    	try {
    		return decodeURIComponent(input);
    	} catch (err) {
    		var tokens = input.match(singleMatcher);

    		for (var i = 1; i < tokens.length; i++) {
    			input = decodeComponents(tokens, i).join('');

    			tokens = input.match(singleMatcher);
    		}

    		return input;
    	}
    }

    function customDecodeURIComponent(input) {
    	// Keep track of all the replacements and prefill the map with the `BOM`
    	var replaceMap = {
    		'%FE%FF': '\uFFFD\uFFFD',
    		'%FF%FE': '\uFFFD\uFFFD'
    	};

    	var match = multiMatcher.exec(input);
    	while (match) {
    		try {
    			// Decode as big chunks as possible
    			replaceMap[match[0]] = decodeURIComponent(match[0]);
    		} catch (err) {
    			var result = decode(match[0]);

    			if (result !== match[0]) {
    				replaceMap[match[0]] = result;
    			}
    		}

    		match = multiMatcher.exec(input);
    	}

    	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
    	replaceMap['%C2'] = '\uFFFD';

    	var entries = Object.keys(replaceMap);

    	for (var i = 0; i < entries.length; i++) {
    		// Replace all decoded components
    		var key = entries[i];
    		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
    	}

    	return input;
    }

    var decodeUriComponent = function (encodedURI) {
    	if (typeof encodedURI !== 'string') {
    		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
    	}

    	try {
    		encodedURI = encodedURI.replace(/\+/g, ' ');

    		// Try the built in decoder first
    		return decodeURIComponent(encodedURI);
    	} catch (err) {
    		// Fallback to a more advanced decoder
    		return customDecodeURIComponent(encodedURI);
    	}
    };

    var splitOnFirst = (string, separator) => {
    	if (!(typeof string === 'string' && typeof separator === 'string')) {
    		throw new TypeError('Expected the arguments to be of type `string`');
    	}

    	if (separator === '') {
    		return [string];
    	}

    	const separatorIndex = string.indexOf(separator);

    	if (separatorIndex === -1) {
    		return [string];
    	}

    	return [
    		string.slice(0, separatorIndex),
    		string.slice(separatorIndex + separator.length)
    	];
    };

    function encoderForArrayFormat(options) {
    	switch (options.arrayFormat) {
    		case 'index':
    			return key => (result, value) => {
    				const index = result.length;
    				if (value === undefined) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[', index, ']'].join('')];
    				}

    				return [
    					...result,
    					[encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')
    				];
    			};

    		case 'bracket':
    			return key => (result, value) => {
    				if (value === undefined) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, [encode(key, options), '[]'].join('')];
    				}

    				return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
    			};

    		case 'comma':
    			return key => (result, value, index) => {
    				if (value === null || value === undefined || value.length === 0) {
    					return result;
    				}

    				if (index === 0) {
    					return [[encode(key, options), '=', encode(value, options)].join('')];
    				}

    				return [[result, encode(value, options)].join(',')];
    			};

    		default:
    			return key => (result, value) => {
    				if (value === undefined) {
    					return result;
    				}

    				if (value === null) {
    					return [...result, encode(key, options)];
    				}

    				return [...result, [encode(key, options), '=', encode(value, options)].join('')];
    			};
    	}
    }

    function parserForArrayFormat(options) {
    	let result;

    	switch (options.arrayFormat) {
    		case 'index':
    			return (key, value, accumulator) => {
    				result = /\[(\d*)\]$/.exec(key);

    				key = key.replace(/\[\d*\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = {};
    				}

    				accumulator[key][result[1]] = value;
    			};

    		case 'bracket':
    			return (key, value, accumulator) => {
    				result = /(\[\])$/.exec(key);
    				key = key.replace(/\[\]$/, '');

    				if (!result) {
    					accumulator[key] = value;
    					return;
    				}

    				if (accumulator[key] === undefined) {
    					accumulator[key] = [value];
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};

    		case 'comma':
    			return (key, value, accumulator) => {
    				const isArray = typeof value === 'string' && value.split('').indexOf(',') > -1;
    				const newValue = isArray ? value.split(',') : value;
    				accumulator[key] = newValue;
    			};

    		default:
    			return (key, value, accumulator) => {
    				if (accumulator[key] === undefined) {
    					accumulator[key] = value;
    					return;
    				}

    				accumulator[key] = [].concat(accumulator[key], value);
    			};
    	}
    }

    function encode(value, options) {
    	if (options.encode) {
    		return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
    	}

    	return value;
    }

    function decode$1(value, options) {
    	if (options.decode) {
    		return decodeUriComponent(value);
    	}

    	return value;
    }

    function keysSorter(input) {
    	if (Array.isArray(input)) {
    		return input.sort();
    	}

    	if (typeof input === 'object') {
    		return keysSorter(Object.keys(input))
    			.sort((a, b) => Number(a) - Number(b))
    			.map(key => input[key]);
    	}

    	return input;
    }

    function removeHash(input) {
    	const hashStart = input.indexOf('#');
    	if (hashStart !== -1) {
    		input = input.slice(0, hashStart);
    	}

    	return input;
    }

    function extract(input) {
    	input = removeHash(input);
    	const queryStart = input.indexOf('?');
    	if (queryStart === -1) {
    		return '';
    	}

    	return input.slice(queryStart + 1);
    }

    function parseValue(value, options) {
    	if (options.parseNumbers && !Number.isNaN(Number(value)) && (typeof value === 'string' && value.trim() !== '')) {
    		value = Number(value);
    	} else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
    		value = value.toLowerCase() === 'true';
    	}

    	return value;
    }

    function parse(input, options) {
    	options = Object.assign({
    		decode: true,
    		sort: true,
    		arrayFormat: 'none',
    		parseNumbers: false,
    		parseBooleans: false
    	}, options);

    	const formatter = parserForArrayFormat(options);

    	// Create an object with no prototype
    	const ret = Object.create(null);

    	if (typeof input !== 'string') {
    		return ret;
    	}

    	input = input.trim().replace(/^[?#&]/, '');

    	if (!input) {
    		return ret;
    	}

    	for (const param of input.split('&')) {
    		let [key, value] = splitOnFirst(param.replace(/\+/g, ' '), '=');

    		// Missing `=` should be `null`:
    		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    		value = value === undefined ? null : decode$1(value, options);
    		formatter(decode$1(key, options), value, ret);
    	}

    	for (const key of Object.keys(ret)) {
    		const value = ret[key];
    		if (typeof value === 'object' && value !== null) {
    			for (const k of Object.keys(value)) {
    				value[k] = parseValue(value[k], options);
    			}
    		} else {
    			ret[key] = parseValue(value, options);
    		}
    	}

    	if (options.sort === false) {
    		return ret;
    	}

    	return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
    		const value = ret[key];
    		if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
    			// Sort object keys, not values
    			result[key] = keysSorter(value);
    		} else {
    			result[key] = value;
    		}

    		return result;
    	}, Object.create(null));
    }

    var extract_1 = extract;
    var parse_1 = parse;

    var stringify = (object, options) => {
    	if (!object) {
    		return '';
    	}

    	options = Object.assign({
    		encode: true,
    		strict: true,
    		arrayFormat: 'none'
    	}, options);

    	const formatter = encoderForArrayFormat(options);
    	const keys = Object.keys(object);

    	if (options.sort !== false) {
    		keys.sort(options.sort);
    	}

    	return keys.map(key => {
    		const value = object[key];

    		if (value === undefined) {
    			return '';
    		}

    		if (value === null) {
    			return encode(key, options);
    		}

    		if (Array.isArray(value)) {
    			return value
    				.reduce(formatter(key), [])
    				.join('&');
    		}

    		return encode(key, options) + '=' + encode(value, options);
    	}).filter(x => x.length > 0).join('&');
    };

    var parseUrl = (input, options) => {
    	return {
    		url: removeHash(input).split('?')[0] || '',
    		query: parse(extract(input), options)
    	};
    };

    var queryString = {
    	extract: extract_1,
    	parse: parse_1,
    	stringify: stringify,
    	parseUrl: parseUrl
    };

    const currentView = writable({view: "Collection", data: {}});

    const go = (view, data) => {
        let qs = queryString.stringify({view, ...data});
        history.pushState({view, data}, `HAMSA - ${view}`,`index.html?${qs}`);
        currentView.set({view, data});
    };

    const loadFromURL = () => {
        let qs = queryString.parse(location.search);
        let view = qs.view || "Collection"; 
        delete qs.view;
        go(view, qs);
    };

    /* src\SelectorButton.svelte generated by Svelte v3.12.1 */
    const { console: console_1 } = globals;

    const file$3 = "src\\SelectorButton.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (67:4) {#each items as item}
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
    			add_location(li, file$3, 67, 8, 1564);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(67:4) {#each items as item}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
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
    			add_location(span, file$3, 62, 8, 1393);
    			attr_dev(i, "class", "fa fa-caret-down");
    			add_location(i, file$3, 63, 8, 1437);
    			attr_dev(div0, "class", "selector-text svelte-15hgir4");
    			add_location(div0, file$3, 61, 4, 1356);
    			attr_dev(ul, "class", "selector-content svelte-15hgir4");
    			toggle_class(ul, "open", ctx.open);
    			add_location(ul, file$3, 65, 4, 1487);
    			attr_dev(div1, "class", "round-wrapper is-selector-categories svelte-15hgir4");
    			add_location(div1, file$3, 60, 0, 1270);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { title="untitled", items=[], key="item" } = $$props;

        let open = false;

        const onClick = (item) => {
            console.log("clicked", item);
            let data = {};
            data[key] = item;
            go("Collection", data);
        };

    	const writable_props = ['title', 'items', 'key'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1.warn(`<SelectorButton> was created with unknown prop '${key}'`);
    	});

    	const click_handler = ({ item }) => {onClick(item);};

    	const click_handler_1 = () => $$invalidate('open', open = !open);

    	$$self.$set = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('key' in $$props) $$invalidate('key', key = $$props.key);
    	};

    	$$self.$capture_state = () => {
    		return { title, items, key, open };
    	};

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate('title', title = $$props.title);
    		if ('items' in $$props) $$invalidate('items', items = $$props.items);
    		if ('key' in $$props) $$invalidate('key', key = $$props.key);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    	};

    	return {
    		title,
    		items,
    		key,
    		open,
    		onClick,
    		click_handler,
    		click_handler_1
    	};
    }

    class SelectorButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, ["title", "items", "key"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SelectorButton", options, id: create_fragment$3.name });
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

    	get key() {
    		throw new Error("<SelectorButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<SelectorButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SearchField.svelte generated by Svelte v3.12.1 */

    const file$4 = "src\\SearchField.svelte";

    function create_fragment$4(ctx) {
    	var div, input, t, i, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			i = element("i");
    			attr_dev(input, "class", "search svelte-1vljxw1");
    			attr_dev(input, "placeholder", "Search");
    			add_location(input, file$4, 46, 2, 884);
    			attr_dev(i, "class", "fa fa-search");
    			add_location(i, file$4, 51, 2, 992);
    			attr_dev(div, "class", "round-wrapper is-search-box svelte-1vljxw1");
    			add_location(div, file$4, 45, 0, 839);

    			dispose = [
    				listen_dev(input, "input", ctx.input_input_handler),
    				listen_dev(input, "keydown", ctx.search)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			set_input_value(input, ctx.query);

    			append_dev(div, t);
    			append_dev(div, i);
    		},

    		p: function update(changed, ctx) {
    			if (changed.query && (input.value !== ctx.query)) set_input_value(input, ctx.query);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let query;

      function search(event) {
        if (event.key === "Enter") {
          console.log("search", query);
          go("Collection", { query });
        }
      }

    	function input_input_handler() {
    		query = this.value;
    		$$invalidate('query', query);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('query' in $$props) $$invalidate('query', query = $$props.query);
    	};

    	return { query, search, input_input_handler };
    }

    class SearchField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SearchField", options, id: create_fragment$4.name });
    	}
    }

    /* src\SelectorControls.svelte generated by Svelte v3.12.1 */

    const file$5 = "src\\SelectorControls.svelte";

    function create_fragment$5(ctx) {
    	var div1, div0, span, t1, t2, t3, t4, current, dispose;

    	var selectorbutton0 = new SelectorButton({
    		props: {
    		title: "Tags",
    		key: "keyword",
    		items: ctx.keywordList
    	},
    		$$inline: true
    	});

    	var selectorbutton1 = new SelectorButton({
    		props: {
    		title: "Artists",
    		key: "artist",
    		items: ctx.artistsList
    	},
    		$$inline: true
    	});

    	var selectorbutton2 = new SelectorButton({
    		props: {
    		title: "Collections",
    		key: "collection",
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
    			add_location(span, file$5, 55, 45, 1432);
    			attr_dev(div0, "class", "bolotinha svelte-1qalh13");
    			add_location(div0, file$5, 55, 4, 1391);
    			attr_dev(div1, "class", "selector-controls svelte-1qalh13");
    			add_location(div1, file$5, 54, 0, 1354);
    			dispose = listen_dev(div0, "click", ctx.goInfo);
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

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

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

        const goInfo = () => {
            go("InfoPage");
        };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('artistsList' in $$props) $$invalidate('artistsList', artistsList = $$props.artistsList);
    		if ('collectionList' in $$props) $$invalidate('collectionList', collectionList = $$props.collectionList);
    		if ('keywordList' in $$props) $$invalidate('keywordList', keywordList = $$props.keywordList);
    	};

    	return {
    		artistsList,
    		collectionList,
    		keywordList,
    		goInfo
    	};
    }

    class SelectorControls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SelectorControls", options, id: create_fragment$5.name });
    	}
    }

    /* src\InfoPage.svelte generated by Svelte v3.12.1 */

    const file$6 = "src\\InfoPage.svelte";

    function create_fragment$6(ctx) {
    	var div1, div0, h1, t1, p0, t3, p1, t4, a, t6, t7, button, dispose;

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
    			add_location(h1, file$6, 20, 9, 421);
    			add_location(p0, file$6, 21, 8, 478);
    			attr_dev(a, "href", "mailto:contact@hindu.org");
    			add_location(a, file$6, 33, 12, 1889);
    			add_location(p1, file$6, 30, 8, 1528);
    			add_location(div0, file$6, 20, 4, 416);
    			attr_dev(button, "class", "back-button svelte-5zgyg");
    			add_location(button, file$6, 35, 4, 1968);
    			attr_dev(div1, "class", "info info-blurb svelte-5zgyg");
    			add_location(div1, file$6, 19, 0, 381);
    			dispose = listen_dev(button, "click", click_handler$1);
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

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    const click_handler$1 = () => history.back();

    class InfoPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "InfoPage", options, id: create_fragment$6.name });
    	}
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var marked = createCommonjsModule(function (module, exports) {
    (function(root) {

    /**
     * Block-Level Grammar
     */

    var block = {
      newline: /^\n+/,
      code: /^( {4}[^\n]+\n*)+/,
      fences: /^ {0,3}(`{3,}|~{3,})([^`~\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
      hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
      heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
      blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
      list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
      html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
        + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
      def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
      nptable: noop,
      table: noop,
      lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
      // regex template, placeholders will be replaced according to different paragraph
      // interruption rules of commonmark and the original markdown spec:
      _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
      text: /^[^\n]+/
    };

    block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
    block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
    block.def = edit(block.def)
      .replace('label', block._label)
      .replace('title', block._title)
      .getRegex();

    block.bullet = /(?:[*+-]|\d{1,9}\.)/;
    block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
    block.item = edit(block.item, 'gm')
      .replace(/bull/g, block.bullet)
      .getRegex();

    block.list = edit(block.list)
      .replace(/bull/g, block.bullet)
      .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
      .replace('def', '\\n+(?=' + block.def.source + ')')
      .getRegex();

    block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
      + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
      + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
      + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
      + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
      + '|track|ul';
    block._comment = /<!--(?!-?>)[\s\S]*?-->/;
    block.html = edit(block.html, 'i')
      .replace('comment', block._comment)
      .replace('tag', block._tag)
      .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
      .getRegex();

    block.paragraph = edit(block._paragraph)
      .replace('hr', block.hr)
      .replace('heading', ' {0,3}#{1,6} +')
      .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}|~{3,})[^`\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)')
      .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();

    block.blockquote = edit(block.blockquote)
      .replace('paragraph', block.paragraph)
      .getRegex();

    /**
     * Normal Block Grammar
     */

    block.normal = merge({}, block);

    /**
     * GFM Block Grammar
     */

    block.gfm = merge({}, block.normal, {
      nptable: /^ *([^|\n ].*\|.*)\n *([-:]+ *\|[-| :]*)(?:\n((?:.*[^>\n ].*(?:\n|$))*)\n*|$)/,
      table: /^ *\|(.+)\n *\|?( *[-:]+[-| :]*)(?:\n((?: *[^>\n ].*(?:\n|$))*)\n*|$)/
    });

    /**
     * Pedantic grammar (original John Gruber's loose markdown specification)
     */

    block.pedantic = merge({}, block.normal, {
      html: edit(
        '^ *(?:comment *(?:\\n|\\s*$)'
        + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
        .replace('comment', block._comment)
        .replace(/tag/g, '(?!(?:'
          + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
          + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
          + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
        .getRegex(),
      def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
      heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
      fences: noop, // fences not supported
      paragraph: edit(block.normal._paragraph)
        .replace('hr', block.hr)
        .replace('heading', ' *#{1,6} *[^\n]')
        .replace('lheading', block.lheading)
        .replace('blockquote', ' {0,3}>')
        .replace('|fences', '')
        .replace('|list', '')
        .replace('|html', '')
        .getRegex()
    });

    /**
     * Block Lexer
     */

    function Lexer(options) {
      this.tokens = [];
      this.tokens.links = Object.create(null);
      this.options = options || marked.defaults;
      this.rules = block.normal;

      if (this.options.pedantic) {
        this.rules = block.pedantic;
      } else if (this.options.gfm) {
        this.rules = block.gfm;
      }
    }

    /**
     * Expose Block Rules
     */

    Lexer.rules = block;

    /**
     * Static Lex Method
     */

    Lexer.lex = function(src, options) {
      var lexer = new Lexer(options);
      return lexer.lex(src);
    };

    /**
     * Preprocessing
     */

    Lexer.prototype.lex = function(src) {
      src = src
        .replace(/\r\n|\r/g, '\n')
        .replace(/\t/g, '    ')
        .replace(/\u00a0/g, ' ')
        .replace(/\u2424/g, '\n');

      return this.token(src, true);
    };

    /**
     * Lexing
     */

    Lexer.prototype.token = function(src, top) {
      src = src.replace(/^ +$/gm, '');
      var next,
          loose,
          cap,
          bull,
          b,
          item,
          listStart,
          listItems,
          t,
          space,
          i,
          tag,
          l,
          isordered,
          istask,
          ischecked;

      while (src) {
        // newline
        if (cap = this.rules.newline.exec(src)) {
          src = src.substring(cap[0].length);
          if (cap[0].length > 1) {
            this.tokens.push({
              type: 'space'
            });
          }
        }

        // code
        if (cap = this.rules.code.exec(src)) {
          var lastToken = this.tokens[this.tokens.length - 1];
          src = src.substring(cap[0].length);
          // An indented code block cannot interrupt a paragraph.
          if (lastToken && lastToken.type === 'paragraph') {
            lastToken.text += '\n' + cap[0].trimRight();
          } else {
            cap = cap[0].replace(/^ {4}/gm, '');
            this.tokens.push({
              type: 'code',
              codeBlockStyle: 'indented',
              text: !this.options.pedantic
                ? rtrim(cap, '\n')
                : cap
            });
          }
          continue;
        }

        // fences
        if (cap = this.rules.fences.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'code',
            lang: cap[2] ? cap[2].trim() : cap[2],
            text: cap[3] || ''
          });
          continue;
        }

        // heading
        if (cap = this.rules.heading.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'heading',
            depth: cap[1].length,
            text: cap[2]
          });
          continue;
        }

        // table no leading pipe (gfm)
        if (cap = this.rules.nptable.exec(src)) {
          item = {
            type: 'table',
            header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            src = src.substring(cap[0].length);

            for (i = 0; i < item.align.length; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            for (i = 0; i < item.cells.length; i++) {
              item.cells[i] = splitCells(item.cells[i], item.header.length);
            }

            this.tokens.push(item);

            continue;
          }
        }

        // hr
        if (cap = this.rules.hr.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'hr'
          });
          continue;
        }

        // blockquote
        if (cap = this.rules.blockquote.exec(src)) {
          src = src.substring(cap[0].length);

          this.tokens.push({
            type: 'blockquote_start'
          });

          cap = cap[0].replace(/^ *> ?/gm, '');

          // Pass `top` to keep the current
          // "toplevel" state. This is exactly
          // how markdown.pl works.
          this.token(cap, top);

          this.tokens.push({
            type: 'blockquote_end'
          });

          continue;
        }

        // list
        if (cap = this.rules.list.exec(src)) {
          src = src.substring(cap[0].length);
          bull = cap[2];
          isordered = bull.length > 1;

          listStart = {
            type: 'list_start',
            ordered: isordered,
            start: isordered ? +bull : '',
            loose: false
          };

          this.tokens.push(listStart);

          // Get each top-level item.
          cap = cap[0].match(this.rules.item);

          listItems = [];
          next = false;
          l = cap.length;
          i = 0;

          for (; i < l; i++) {
            item = cap[i];

            // Remove the list item's bullet
            // so it is seen as the next token.
            space = item.length;
            item = item.replace(/^ *([*+-]|\d+\.) */, '');

            // Outdent whatever the
            // list item contains. Hacky.
            if (~item.indexOf('\n ')) {
              space -= item.length;
              item = !this.options.pedantic
                ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
                : item.replace(/^ {1,4}/gm, '');
            }

            // Determine whether the next list item belongs here.
            // Backpedal if it does not belong in this list.
            if (i !== l - 1) {
              b = block.bullet.exec(cap[i + 1])[0];
              if (bull.length > 1 ? b.length === 1
                : (b.length > 1 || (this.options.smartLists && b !== bull))) {
                src = cap.slice(i + 1).join('\n') + src;
                i = l - 1;
              }
            }

            // Determine whether item is loose or not.
            // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
            // for discount behavior.
            loose = next || /\n\n(?!\s*$)/.test(item);
            if (i !== l - 1) {
              next = item.charAt(item.length - 1) === '\n';
              if (!loose) loose = next;
            }

            if (loose) {
              listStart.loose = true;
            }

            // Check for task list items
            istask = /^\[[ xX]\] /.test(item);
            ischecked = undefined;
            if (istask) {
              ischecked = item[1] !== ' ';
              item = item.replace(/^\[[ xX]\] +/, '');
            }

            t = {
              type: 'list_item_start',
              task: istask,
              checked: ischecked,
              loose: loose
            };

            listItems.push(t);
            this.tokens.push(t);

            // Recurse.
            this.token(item, false);

            this.tokens.push({
              type: 'list_item_end'
            });
          }

          if (listStart.loose) {
            l = listItems.length;
            i = 0;
            for (; i < l; i++) {
              listItems[i].loose = true;
            }
          }

          this.tokens.push({
            type: 'list_end'
          });

          continue;
        }

        // html
        if (cap = this.rules.html.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: this.options.sanitize
              ? 'paragraph'
              : 'html',
            pre: !this.options.sanitizer
              && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
            text: this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]
          });
          continue;
        }

        // def
        if (top && (cap = this.rules.def.exec(src))) {
          src = src.substring(cap[0].length);
          if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
          tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
          if (!this.tokens.links[tag]) {
            this.tokens.links[tag] = {
              href: cap[2],
              title: cap[3]
            };
          }
          continue;
        }

        // table (gfm)
        if (cap = this.rules.table.exec(src)) {
          item = {
            type: 'table',
            header: splitCells(cap[1].replace(/^ *| *\| *$/g, '')),
            align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
          };

          if (item.header.length === item.align.length) {
            src = src.substring(cap[0].length);

            for (i = 0; i < item.align.length; i++) {
              if (/^ *-+: *$/.test(item.align[i])) {
                item.align[i] = 'right';
              } else if (/^ *:-+: *$/.test(item.align[i])) {
                item.align[i] = 'center';
              } else if (/^ *:-+ *$/.test(item.align[i])) {
                item.align[i] = 'left';
              } else {
                item.align[i] = null;
              }
            }

            for (i = 0; i < item.cells.length; i++) {
              item.cells[i] = splitCells(
                item.cells[i].replace(/^ *\| *| *\| *$/g, ''),
                item.header.length);
            }

            this.tokens.push(item);

            continue;
          }
        }

        // lheading
        if (cap = this.rules.lheading.exec(src)) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'heading',
            depth: cap[2].charAt(0) === '=' ? 1 : 2,
            text: cap[1]
          });
          continue;
        }

        // top-level paragraph
        if (top && (cap = this.rules.paragraph.exec(src))) {
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'paragraph',
            text: cap[1].charAt(cap[1].length - 1) === '\n'
              ? cap[1].slice(0, -1)
              : cap[1]
          });
          continue;
        }

        // text
        if (cap = this.rules.text.exec(src)) {
          // Top-level should never reach here.
          src = src.substring(cap[0].length);
          this.tokens.push({
            type: 'text',
            text: cap[0]
          });
          continue;
        }

        if (src) {
          throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
        }
      }

      return this.tokens;
    };

    /**
     * Inline-Level Grammar
     */

    var inline = {
      escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
      autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
      url: noop,
      tag: '^comment'
        + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
      link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
      reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
      nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
      strong: /^__([^\s_])__(?!_)|^\*\*([^\s*])\*\*(?!\*)|^__([^\s][\s\S]*?[^\s])__(?!_)|^\*\*([^\s][\s\S]*?[^\s])\*\*(?!\*)/,
      em: /^_([^\s_])_(?!_)|^\*([^\s*<\[])\*(?!\*)|^_([^\s<][\s\S]*?[^\s_])_(?!_|[^\spunctuation])|^_([^\s_<][\s\S]*?[^\s])_(?!_|[^\spunctuation])|^\*([^\s<"][\s\S]*?[^\s\*])\*(?!\*|[^\spunctuation])|^\*([^\s*"<\[][\s\S]*?[^\s])\*(?!\*)/,
      code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
      br: /^( {2,}|\\)\n(?!\s*$)/,
      del: noop,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/
    };

    // list of punctuation marks from common mark spec
    // without ` and ] to workaround Rule 17 (inline code blocks/links)
    inline._punctuation = '!"#$%&\'()*+,\\-./:;<=>?@\\[^_{|}~';
    inline.em = edit(inline.em).replace(/punctuation/g, inline._punctuation).getRegex();

    inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

    inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
    inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
    inline.autolink = edit(inline.autolink)
      .replace('scheme', inline._scheme)
      .replace('email', inline._email)
      .getRegex();

    inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

    inline.tag = edit(inline.tag)
      .replace('comment', block._comment)
      .replace('attribute', inline._attribute)
      .getRegex();

    inline._label = /(?:\[[^\[\]]*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
    inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
    inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

    inline.link = edit(inline.link)
      .replace('label', inline._label)
      .replace('href', inline._href)
      .replace('title', inline._title)
      .getRegex();

    inline.reflink = edit(inline.reflink)
      .replace('label', inline._label)
      .getRegex();

    /**
     * Normal Inline Grammar
     */

    inline.normal = merge({}, inline);

    /**
     * Pedantic Inline Grammar
     */

    inline.pedantic = merge({}, inline.normal, {
      strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
      em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/,
      link: edit(/^!?\[(label)\]\((.*?)\)/)
        .replace('label', inline._label)
        .getRegex(),
      reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
        .replace('label', inline._label)
        .getRegex()
    });

    /**
     * GFM Inline Grammar
     */

    inline.gfm = merge({}, inline.normal, {
      escape: edit(inline.escape).replace('])', '~|])').getRegex(),
      _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
      url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
      _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
      del: /^~+(?=\S)([\s\S]*?\S)~+/,
      text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
    });

    inline.gfm.url = edit(inline.gfm.url, 'i')
      .replace('email', inline.gfm._extended_email)
      .getRegex();
    /**
     * GFM + Line Breaks Inline Grammar
     */

    inline.breaks = merge({}, inline.gfm, {
      br: edit(inline.br).replace('{2,}', '*').getRegex(),
      text: edit(inline.gfm.text)
        .replace('\\b_', '\\b_| {2,}\\n')
        .replace(/\{2,\}/g, '*')
        .getRegex()
    });

    /**
     * Inline Lexer & Compiler
     */

    function InlineLexer(links, options) {
      this.options = options || marked.defaults;
      this.links = links;
      this.rules = inline.normal;
      this.renderer = this.options.renderer || new Renderer();
      this.renderer.options = this.options;

      if (!this.links) {
        throw new Error('Tokens array requires a `links` property.');
      }

      if (this.options.pedantic) {
        this.rules = inline.pedantic;
      } else if (this.options.gfm) {
        if (this.options.breaks) {
          this.rules = inline.breaks;
        } else {
          this.rules = inline.gfm;
        }
      }
    }

    /**
     * Expose Inline Rules
     */

    InlineLexer.rules = inline;

    /**
     * Static Lexing/Compiling Method
     */

    InlineLexer.output = function(src, links, options) {
      var inline = new InlineLexer(links, options);
      return inline.output(src);
    };

    /**
     * Lexing/Compiling
     */

    InlineLexer.prototype.output = function(src) {
      var out = '',
          link,
          text,
          href,
          title,
          cap,
          prevCapZero;

      while (src) {
        // escape
        if (cap = this.rules.escape.exec(src)) {
          src = src.substring(cap[0].length);
          out += escape(cap[1]);
          continue;
        }

        // tag
        if (cap = this.rules.tag.exec(src)) {
          if (!this.inLink && /^<a /i.test(cap[0])) {
            this.inLink = true;
          } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
            this.inLink = false;
          }
          if (!this.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.inRawBlock = true;
          } else if (this.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
            this.inRawBlock = false;
          }

          src = src.substring(cap[0].length);
          out += this.options.sanitize
            ? this.options.sanitizer
              ? this.options.sanitizer(cap[0])
              : escape(cap[0])
            : cap[0];
          continue;
        }

        // link
        if (cap = this.rules.link.exec(src)) {
          var lastParenIndex = findClosingBracket(cap[2], '()');
          if (lastParenIndex > -1) {
            var linkLen = 4 + cap[1].length + lastParenIndex;
            cap[2] = cap[2].substring(0, lastParenIndex);
            cap[0] = cap[0].substring(0, linkLen).trim();
            cap[3] = '';
          }
          src = src.substring(cap[0].length);
          this.inLink = true;
          href = cap[2];
          if (this.options.pedantic) {
            link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

            if (link) {
              href = link[1];
              title = link[3];
            } else {
              title = '';
            }
          } else {
            title = cap[3] ? cap[3].slice(1, -1) : '';
          }
          href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
          out += this.outputLink(cap, {
            href: InlineLexer.escapes(href),
            title: InlineLexer.escapes(title)
          });
          this.inLink = false;
          continue;
        }

        // reflink, nolink
        if ((cap = this.rules.reflink.exec(src))
            || (cap = this.rules.nolink.exec(src))) {
          src = src.substring(cap[0].length);
          link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
          link = this.links[link.toLowerCase()];
          if (!link || !link.href) {
            out += cap[0].charAt(0);
            src = cap[0].substring(1) + src;
            continue;
          }
          this.inLink = true;
          out += this.outputLink(cap, link);
          this.inLink = false;
          continue;
        }

        // strong
        if (cap = this.rules.strong.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.strong(this.output(cap[4] || cap[3] || cap[2] || cap[1]));
          continue;
        }

        // em
        if (cap = this.rules.em.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.em(this.output(cap[6] || cap[5] || cap[4] || cap[3] || cap[2] || cap[1]));
          continue;
        }

        // code
        if (cap = this.rules.code.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.codespan(escape(cap[2].trim(), true));
          continue;
        }

        // br
        if (cap = this.rules.br.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.br();
          continue;
        }

        // del (gfm)
        if (cap = this.rules.del.exec(src)) {
          src = src.substring(cap[0].length);
          out += this.renderer.del(this.output(cap[1]));
          continue;
        }

        // autolink
        if (cap = this.rules.autolink.exec(src)) {
          src = src.substring(cap[0].length);
          if (cap[2] === '@') {
            text = escape(this.mangle(cap[1]));
            href = 'mailto:' + text;
          } else {
            text = escape(cap[1]);
            href = text;
          }
          out += this.renderer.link(href, null, text);
          continue;
        }

        // url (gfm)
        if (!this.inLink && (cap = this.rules.url.exec(src))) {
          if (cap[2] === '@') {
            text = escape(cap[0]);
            href = 'mailto:' + text;
          } else {
            // do extended autolink path validation
            do {
              prevCapZero = cap[0];
              cap[0] = this.rules._backpedal.exec(cap[0])[0];
            } while (prevCapZero !== cap[0]);
            text = escape(cap[0]);
            if (cap[1] === 'www.') {
              href = 'http://' + text;
            } else {
              href = text;
            }
          }
          src = src.substring(cap[0].length);
          out += this.renderer.link(href, null, text);
          continue;
        }

        // text
        if (cap = this.rules.text.exec(src)) {
          src = src.substring(cap[0].length);
          if (this.inRawBlock) {
            out += this.renderer.text(this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0]);
          } else {
            out += this.renderer.text(escape(this.smartypants(cap[0])));
          }
          continue;
        }

        if (src) {
          throw new Error('Infinite loop on byte: ' + src.charCodeAt(0));
        }
      }

      return out;
    };

    InlineLexer.escapes = function(text) {
      return text ? text.replace(InlineLexer.rules._escapes, '$1') : text;
    };

    /**
     * Compile Link
     */

    InlineLexer.prototype.outputLink = function(cap, link) {
      var href = link.href,
          title = link.title ? escape(link.title) : null;

      return cap[0].charAt(0) !== '!'
        ? this.renderer.link(href, title, this.output(cap[1]))
        : this.renderer.image(href, title, escape(cap[1]));
    };

    /**
     * Smartypants Transformations
     */

    InlineLexer.prototype.smartypants = function(text) {
      if (!this.options.smartypants) return text;
      return text
        // em-dashes
        .replace(/---/g, '\u2014')
        // en-dashes
        .replace(/--/g, '\u2013')
        // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
        // closing singles & apostrophes
        .replace(/'/g, '\u2019')
        // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
        // closing doubles
        .replace(/"/g, '\u201d')
        // ellipses
        .replace(/\.{3}/g, '\u2026');
    };

    /**
     * Mangle Links
     */

    InlineLexer.prototype.mangle = function(text) {
      if (!this.options.mangle) return text;
      var out = '',
          l = text.length,
          i = 0,
          ch;

      for (; i < l; i++) {
        ch = text.charCodeAt(i);
        if (Math.random() > 0.5) {
          ch = 'x' + ch.toString(16);
        }
        out += '&#' + ch + ';';
      }

      return out;
    };

    /**
     * Renderer
     */

    function Renderer(options) {
      this.options = options || marked.defaults;
    }

    Renderer.prototype.code = function(code, infostring, escaped) {
      var lang = (infostring || '').match(/\S*/)[0];
      if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre><code>'
          + (escaped ? code : escape(code, true))
          + '</code></pre>';
      }

      return '<pre><code class="'
        + this.options.langPrefix
        + escape(lang, true)
        + '">'
        + (escaped ? code : escape(code, true))
        + '</code></pre>\n';
    };

    Renderer.prototype.blockquote = function(quote) {
      return '<blockquote>\n' + quote + '</blockquote>\n';
    };

    Renderer.prototype.html = function(html) {
      return html;
    };

    Renderer.prototype.heading = function(text, level, raw, slugger) {
      if (this.options.headerIds) {
        return '<h'
          + level
          + ' id="'
          + this.options.headerPrefix
          + slugger.slug(raw)
          + '">'
          + text
          + '</h'
          + level
          + '>\n';
      }
      // ignore IDs
      return '<h' + level + '>' + text + '</h' + level + '>\n';
    };

    Renderer.prototype.hr = function() {
      return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
    };

    Renderer.prototype.list = function(body, ordered, start) {
      var type = ordered ? 'ol' : 'ul',
          startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
      return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
    };

    Renderer.prototype.listitem = function(text) {
      return '<li>' + text + '</li>\n';
    };

    Renderer.prototype.checkbox = function(checked) {
      return '<input '
        + (checked ? 'checked="" ' : '')
        + 'disabled="" type="checkbox"'
        + (this.options.xhtml ? ' /' : '')
        + '> ';
    };

    Renderer.prototype.paragraph = function(text) {
      return '<p>' + text + '</p>\n';
    };

    Renderer.prototype.table = function(header, body) {
      if (body) body = '<tbody>' + body + '</tbody>';

      return '<table>\n'
        + '<thead>\n'
        + header
        + '</thead>\n'
        + body
        + '</table>\n';
    };

    Renderer.prototype.tablerow = function(content) {
      return '<tr>\n' + content + '</tr>\n';
    };

    Renderer.prototype.tablecell = function(content, flags) {
      var type = flags.header ? 'th' : 'td';
      var tag = flags.align
        ? '<' + type + ' align="' + flags.align + '">'
        : '<' + type + '>';
      return tag + content + '</' + type + '>\n';
    };

    // span level renderer
    Renderer.prototype.strong = function(text) {
      return '<strong>' + text + '</strong>';
    };

    Renderer.prototype.em = function(text) {
      return '<em>' + text + '</em>';
    };

    Renderer.prototype.codespan = function(text) {
      return '<code>' + text + '</code>';
    };

    Renderer.prototype.br = function() {
      return this.options.xhtml ? '<br/>' : '<br>';
    };

    Renderer.prototype.del = function(text) {
      return '<del>' + text + '</del>';
    };

    Renderer.prototype.link = function(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }
      var out = '<a href="' + escape(href) + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    };

    Renderer.prototype.image = function(href, title, text) {
      href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
      if (href === null) {
        return text;
      }

      var out = '<img src="' + href + '" alt="' + text + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += this.options.xhtml ? '/>' : '>';
      return out;
    };

    Renderer.prototype.text = function(text) {
      return text;
    };

    /**
     * TextRenderer
     * returns only the textual part of the token
     */

    function TextRenderer() {}

    // no need for block level renderers

    TextRenderer.prototype.strong =
    TextRenderer.prototype.em =
    TextRenderer.prototype.codespan =
    TextRenderer.prototype.del =
    TextRenderer.prototype.text = function(text) {
      return text;
    };

    TextRenderer.prototype.link =
    TextRenderer.prototype.image = function(href, title, text) {
      return '' + text;
    };

    TextRenderer.prototype.br = function() {
      return '';
    };

    /**
     * Parsing & Compiling
     */

    function Parser(options) {
      this.tokens = [];
      this.token = null;
      this.options = options || marked.defaults;
      this.options.renderer = this.options.renderer || new Renderer();
      this.renderer = this.options.renderer;
      this.renderer.options = this.options;
      this.slugger = new Slugger();
    }

    /**
     * Static Parse Method
     */

    Parser.parse = function(src, options) {
      var parser = new Parser(options);
      return parser.parse(src);
    };

    /**
     * Parse Loop
     */

    Parser.prototype.parse = function(src) {
      this.inline = new InlineLexer(src.links, this.options);
      // use an InlineLexer with a TextRenderer to extract pure text
      this.inlineText = new InlineLexer(
        src.links,
        merge({}, this.options, { renderer: new TextRenderer() })
      );
      this.tokens = src.reverse();

      var out = '';
      while (this.next()) {
        out += this.tok();
      }

      return out;
    };

    /**
     * Next Token
     */

    Parser.prototype.next = function() {
      this.token = this.tokens.pop();
      return this.token;
    };

    /**
     * Preview Next Token
     */

    Parser.prototype.peek = function() {
      return this.tokens[this.tokens.length - 1] || 0;
    };

    /**
     * Parse Text Tokens
     */

    Parser.prototype.parseText = function() {
      var body = this.token.text;

      while (this.peek().type === 'text') {
        body += '\n' + this.next().text;
      }

      return this.inline.output(body);
    };

    /**
     * Parse Current Token
     */

    Parser.prototype.tok = function() {
      switch (this.token.type) {
        case 'space': {
          return '';
        }
        case 'hr': {
          return this.renderer.hr();
        }
        case 'heading': {
          return this.renderer.heading(
            this.inline.output(this.token.text),
            this.token.depth,
            unescape(this.inlineText.output(this.token.text)),
            this.slugger);
        }
        case 'code': {
          return this.renderer.code(this.token.text,
            this.token.lang,
            this.token.escaped);
        }
        case 'table': {
          var header = '',
              body = '',
              i,
              row,
              cell,
              j;

          // header
          cell = '';
          for (i = 0; i < this.token.header.length; i++) {
            cell += this.renderer.tablecell(
              this.inline.output(this.token.header[i]),
              { header: true, align: this.token.align[i] }
            );
          }
          header += this.renderer.tablerow(cell);

          for (i = 0; i < this.token.cells.length; i++) {
            row = this.token.cells[i];

            cell = '';
            for (j = 0; j < row.length; j++) {
              cell += this.renderer.tablecell(
                this.inline.output(row[j]),
                { header: false, align: this.token.align[j] }
              );
            }

            body += this.renderer.tablerow(cell);
          }
          return this.renderer.table(header, body);
        }
        case 'blockquote_start': {
          body = '';

          while (this.next().type !== 'blockquote_end') {
            body += this.tok();
          }

          return this.renderer.blockquote(body);
        }
        case 'list_start': {
          body = '';
          var ordered = this.token.ordered,
              start = this.token.start;

          while (this.next().type !== 'list_end') {
            body += this.tok();
          }

          return this.renderer.list(body, ordered, start);
        }
        case 'list_item_start': {
          body = '';
          var loose = this.token.loose;
          var checked = this.token.checked;
          var task = this.token.task;

          if (this.token.task) {
            body += this.renderer.checkbox(checked);
          }

          while (this.next().type !== 'list_item_end') {
            body += !loose && this.token.type === 'text'
              ? this.parseText()
              : this.tok();
          }
          return this.renderer.listitem(body, task, checked);
        }
        case 'html': {
          // TODO parse inline content if parameter markdown=1
          return this.renderer.html(this.token.text);
        }
        case 'paragraph': {
          return this.renderer.paragraph(this.inline.output(this.token.text));
        }
        case 'text': {
          return this.renderer.paragraph(this.parseText());
        }
        default: {
          var errMsg = 'Token with "' + this.token.type + '" type was not found.';
          if (this.options.silent) {
            console.log(errMsg);
          } else {
            throw new Error(errMsg);
          }
        }
      }
    };

    /**
     * Slugger generates header id
     */

    function Slugger() {
      this.seen = {};
    }

    /**
     * Convert string to unique id
     */

    Slugger.prototype.slug = function(value) {
      var slug = value
        .toLowerCase()
        .trim()
        .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
        .replace(/\s/g, '-');

      if (this.seen.hasOwnProperty(slug)) {
        var originalSlug = slug;
        do {
          this.seen[originalSlug]++;
          slug = originalSlug + '-' + this.seen[originalSlug];
        } while (this.seen.hasOwnProperty(slug));
      }
      this.seen[slug] = 0;

      return slug;
    };

    /**
     * Helpers
     */

    function escape(html, encode) {
      if (encode) {
        if (escape.escapeTest.test(html)) {
          return html.replace(escape.escapeReplace, function(ch) { return escape.replacements[ch]; });
        }
      } else {
        if (escape.escapeTestNoEncode.test(html)) {
          return html.replace(escape.escapeReplaceNoEncode, function(ch) { return escape.replacements[ch]; });
        }
      }

      return html;
    }

    escape.escapeTest = /[&<>"']/;
    escape.escapeReplace = /[&<>"']/g;
    escape.replacements = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
    escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;

    function unescape(html) {
      // explicitly match decimal, hex, and named HTML entities
      return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig, function(_, n) {
        n = n.toLowerCase();
        if (n === 'colon') return ':';
        if (n.charAt(0) === '#') {
          return n.charAt(1) === 'x'
            ? String.fromCharCode(parseInt(n.substring(2), 16))
            : String.fromCharCode(+n.substring(1));
        }
        return '';
      });
    }

    function edit(regex, opt) {
      regex = regex.source || regex;
      opt = opt || '';
      return {
        replace: function(name, val) {
          val = val.source || val;
          val = val.replace(/(^|[^\[])\^/g, '$1');
          regex = regex.replace(name, val);
          return this;
        },
        getRegex: function() {
          return new RegExp(regex, opt);
        }
      };
    }

    function cleanUrl(sanitize, base, href) {
      if (sanitize) {
        try {
          var prot = decodeURIComponent(unescape(href))
            .replace(/[^\w:]/g, '')
            .toLowerCase();
        } catch (e) {
          return null;
        }
        if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
          return null;
        }
      }
      if (base && !originIndependentUrl.test(href)) {
        href = resolveUrl(base, href);
      }
      try {
        href = encodeURI(href).replace(/%25/g, '%');
      } catch (e) {
        return null;
      }
      return href;
    }

    function resolveUrl(base, href) {
      if (!baseUrls[' ' + base]) {
        // we can ignore everything in base after the last slash of its path component,
        // but we might need to add _that_
        // https://tools.ietf.org/html/rfc3986#section-3
        if (/^[^:]+:\/*[^/]*$/.test(base)) {
          baseUrls[' ' + base] = base + '/';
        } else {
          baseUrls[' ' + base] = rtrim(base, '/', true);
        }
      }
      base = baseUrls[' ' + base];

      if (href.slice(0, 2) === '//') {
        return base.replace(/:[\s\S]*/, ':') + href;
      } else if (href.charAt(0) === '/') {
        return base.replace(/(:\/*[^/]*)[\s\S]*/, '$1') + href;
      } else {
        return base + href;
      }
    }
    var baseUrls = {};
    var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

    function noop() {}
    noop.exec = noop;

    function merge(obj) {
      var i = 1,
          target,
          key;

      for (; i < arguments.length; i++) {
        target = arguments[i];
        for (key in target) {
          if (Object.prototype.hasOwnProperty.call(target, key)) {
            obj[key] = target[key];
          }
        }
      }

      return obj;
    }

    function splitCells(tableRow, count) {
      // ensure that every cell-delimiting pipe has a space
      // before it to distinguish it from an escaped pipe
      var row = tableRow.replace(/\|/g, function(match, offset, str) {
            var escaped = false,
                curr = offset;
            while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
            if (escaped) {
              // odd number of slashes means | is escaped
              // so we leave it alone
              return '|';
            } else {
              // add space before unescaped |
              return ' |';
            }
          }),
          cells = row.split(/ \|/),
          i = 0;

      if (cells.length > count) {
        cells.splice(count);
      } else {
        while (cells.length < count) cells.push('');
      }

      for (; i < cells.length; i++) {
        // leading or trailing whitespace is ignored per the gfm spec
        cells[i] = cells[i].trim().replace(/\\\|/g, '|');
      }
      return cells;
    }

    // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
    // /c*$/ is vulnerable to REDOS.
    // invert: Remove suffix of non-c chars instead. Default falsey.
    function rtrim(str, c, invert) {
      if (str.length === 0) {
        return '';
      }

      // Length of suffix matching the invert condition.
      var suffLen = 0;

      // Step left until we fail to match the invert condition.
      while (suffLen < str.length) {
        var currChar = str.charAt(str.length - suffLen - 1);
        if (currChar === c && !invert) {
          suffLen++;
        } else if (currChar !== c && invert) {
          suffLen++;
        } else {
          break;
        }
      }

      return str.substr(0, str.length - suffLen);
    }

    function findClosingBracket(str, b) {
      if (str.indexOf(b[1]) === -1) {
        return -1;
      }
      var level = 0;
      for (var i = 0; i < str.length; i++) {
        if (str[i] === '\\') {
          i++;
        } else if (str[i] === b[0]) {
          level++;
        } else if (str[i] === b[1]) {
          level--;
          if (level < 0) {
            return i;
          }
        }
      }
      return -1;
    }

    function checkSanitizeDeprecation(opt) {
      if (opt && opt.sanitize && !opt.silent) {
        console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
      }
    }

    /**
     * Marked
     */

    function marked(src, opt, callback) {
      // throw error in case of non string input
      if (typeof src === 'undefined' || src === null) {
        throw new Error('marked(): input parameter is undefined or null');
      }
      if (typeof src !== 'string') {
        throw new Error('marked(): input parameter is of type '
          + Object.prototype.toString.call(src) + ', string expected');
      }

      if (callback || typeof opt === 'function') {
        if (!callback) {
          callback = opt;
          opt = null;
        }

        opt = merge({}, marked.defaults, opt || {});
        checkSanitizeDeprecation(opt);

        var highlight = opt.highlight,
            tokens,
            pending,
            i = 0;

        try {
          tokens = Lexer.lex(src, opt);
        } catch (e) {
          return callback(e);
        }

        pending = tokens.length;

        var done = function(err) {
          if (err) {
            opt.highlight = highlight;
            return callback(err);
          }

          var out;

          try {
            out = Parser.parse(tokens, opt);
          } catch (e) {
            err = e;
          }

          opt.highlight = highlight;

          return err
            ? callback(err)
            : callback(null, out);
        };

        if (!highlight || highlight.length < 3) {
          return done();
        }

        delete opt.highlight;

        if (!pending) return done();

        for (; i < tokens.length; i++) {
          (function(token) {
            if (token.type !== 'code') {
              return --pending || done();
            }
            return highlight(token.text, token.lang, function(err, code) {
              if (err) return done(err);
              if (code == null || code === token.text) {
                return --pending || done();
              }
              token.text = code;
              token.escaped = true;
              --pending || done();
            });
          })(tokens[i]);
        }

        return;
      }
      try {
        if (opt) opt = merge({}, marked.defaults, opt);
        checkSanitizeDeprecation(opt);
        return Parser.parse(Lexer.lex(src, opt), opt);
      } catch (e) {
        e.message += '\nPlease report this to https://github.com/markedjs/marked.';
        if ((opt || marked.defaults).silent) {
          return '<p>An error occurred:</p><pre>'
            + escape(e.message + '', true)
            + '</pre>';
        }
        throw e;
      }
    }

    /**
     * Options
     */

    marked.options =
    marked.setOptions = function(opt) {
      merge(marked.defaults, opt);
      return marked;
    };

    marked.getDefaults = function() {
      return {
        baseUrl: null,
        breaks: false,
        gfm: true,
        headerIds: true,
        headerPrefix: '',
        highlight: null,
        langPrefix: 'language-',
        mangle: true,
        pedantic: false,
        renderer: new Renderer(),
        sanitize: false,
        sanitizer: null,
        silent: false,
        smartLists: false,
        smartypants: false,
        xhtml: false
      };
    };

    marked.defaults = marked.getDefaults();

    /**
     * Expose
     */

    marked.Parser = Parser;
    marked.parser = Parser.parse;

    marked.Renderer = Renderer;
    marked.TextRenderer = TextRenderer;

    marked.Lexer = Lexer;
    marked.lexer = Lexer.lex;

    marked.InlineLexer = InlineLexer;
    marked.inlineLexer = InlineLexer.output;

    marked.Slugger = Slugger;

    marked.parse = marked;

    {
      module.exports = marked;
    }
    })();
    });

    /* src\Collection.svelte generated by Svelte v3.12.1 */

    const file$7 = "src\\Collection.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.item = list[i];
    	return child_ctx;
    }

    // (246:2) {:else}
    function create_else_block$2(ctx) {
    	var t0, div1, div0, t1, section;

    	function select_block_type_1(changed, ctx) {
    		if (ctx.collection !== 'home') return create_if_block_2;
    		if (ctx.$loggedIn) return create_if_block_5;
    	}

    	var current_block_type = select_block_type_1(null, ctx);
    	var if_block = current_block_type && current_block_type(ctx);

    	let each_value = ctx.images;

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
    			attr_dev(div0, "class", "collection-inner svelte-vwvw8z");
    			add_location(div0, file$7, 288, 6, 6567);
    			attr_dev(section, "class", "g svelte-vwvw8z");
    			add_location(section, file$7, 289, 6, 6607);
    			attr_dev(div1, "class", "collection");
    			add_location(div1, file$7, 287, 4, 6535);
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
    			if (current_block_type === (current_block_type = select_block_type_1(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(t0.parentNode, t0);
    				}
    			}

    			if (changed.thumbnailToURL || changed.images || changed.$loggedIn || changed.collection) {
    				each_value = ctx.images;

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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$2.name, type: "else", source: "(246:2) {:else}", ctx });
    	return block;
    }

    // (242:2) {#if images.length == 0}
    function create_if_block$2(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$7, 243, 6, 5233);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$7, 242, 4, 5196);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(242:2) {#if images.length == 0}", ctx });
    	return block;
    }

    // (274:24) 
    function create_if_block_5(ctx) {
    	var div, h3, span, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			span = element("span");
    			span.textContent = "(Edit Selected Images)";
    			attr_dev(span, "class", "editor-trigger svelte-vwvw8z");
    			add_location(span, file$7, 276, 10, 6271);
    			attr_dev(h3, "class", "collection-title svelte-vwvw8z");
    			add_location(h3, file$7, 275, 8, 6230);
    			attr_dev(div, "class", "collection-header svelte-vwvw8z");
    			add_location(div, file$7, 274, 6, 6189);
    			dispose = listen_dev(span, "click", ctx.click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, span);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_5.name, type: "if", source: "(274:24) ", ctx });
    	return block;
    }

    // (247:4) {#if collection !== 'home'}
    function create_if_block_2(ctx) {
    	var div1, h3, t0, t1, t2, div0, t3, p;

    	var if_block0 = (ctx.$loggedIn) && create_if_block_4(ctx);

    	var if_block1 = (ctx.collectionThumb) && create_if_block_3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(ctx.collection);
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div0 = element("div");
    			if (if_block1) if_block1.c();
    			t3 = space();
    			p = element("p");
    			attr_dev(h3, "class", "collection-title svelte-vwvw8z");
    			add_location(h3, file$7, 248, 8, 5379);
    			attr_dev(p, "class", "collection-description svelte-vwvw8z");
    			add_location(p, file$7, 268, 10, 6042);
    			attr_dev(div0, "class", "collection-metadata svelte-vwvw8z");
    			add_location(div0, file$7, 260, 8, 5743);
    			attr_dev(div1, "class", "collection-header svelte-vwvw8z");
    			add_location(div1, file$7, 247, 6, 5338);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			if (if_block0) if_block0.m(h3, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			if (if_block1) if_block1.m(div0, null);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			p.innerHTML = ctx.description;
    		},

    		p: function update(changed, ctx) {
    			if (changed.collection) {
    				set_data_dev(t0, ctx.collection);
    			}

    			if (ctx.$loggedIn) {
    				if (!if_block0) {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(h3, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.collectionThumb) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (changed.description) {
    				p.innerHTML = ctx.description;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(247:4) {#if collection !== 'home'}", ctx });
    	return block;
    }

    // (251:10) {#if $loggedIn}
    function create_if_block_4(ctx) {
    	var span, dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "(Edit Selected Images)";
    			attr_dev(span, "class", "editor-trigger svelte-vwvw8z");
    			add_location(span, file$7, 251, 12, 5473);
    			dispose = listen_dev(span, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(251:10) {#if $loggedIn}", ctx });
    	return block;
    }

    // (262:10) {#if collectionThumb}
    function create_if_block_3(ctx) {
    	var img, img_alt_value, dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "src", ctx.collectionThumb);
    			attr_dev(img, "alt", img_alt_value = "photo: " + ctx.collection);
    			attr_dev(img, "class", "svelte-vwvw8z");
    			toggle_class(img, "hidden", !ctx.collectionThumb);
    			add_location(img, file$7, 262, 12, 5823);
    			dispose = listen_dev(img, "error", ctx.error_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.collectionThumb) {
    				attr_dev(img, "src", ctx.collectionThumb);
    			}

    			if ((changed.collection) && img_alt_value !== (img_alt_value = "photo: " + ctx.collection)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (changed.collectionThumb) {
    				toggle_class(img, "hidden", !ctx.collectionThumb);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(262:10) {#if collectionThumb}", ctx });
    	return block;
    }

    // (312:8) {:else}
    function create_else_block_1(ctx) {
    	var p, t0, t1, t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("Sorry but we couldn't find images related to ");
    			t1 = text(ctx.collection);
    			t2 = text(".\r\n          ");
    			attr_dev(p, "class", "no-collection svelte-vwvw8z");
    			add_location(p, file$7, 312, 10, 7431);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.collection) {
    				set_data_dev(t1, ctx.collection);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1.name, type: "else", source: "(312:8) {:else}", ctx });
    	return block;
    }

    // (293:12) {#if $loggedIn}
    function create_if_block_1$2(ctx) {
    	var label, input, t, span, dispose;

    	function click_handler_2(...args) {
    		return ctx.click_handler_2(ctx, ...args);
    	}

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t = space();
    			span = element("span");
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-vwvw8z");
    			add_location(input, file$7, 294, 16, 6773);
    			attr_dev(span, "class", "svelte-vwvw8z");
    			add_location(span, file$7, 304, 16, 7163);
    			attr_dev(label, "class", "checkbox svelte-vwvw8z");
    			add_location(label, file$7, 293, 14, 6731);
    			dispose = listen_dev(input, "click", stop_propagation(click_handler_2), false, false, true);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			append_dev(label, t);
    			append_dev(label, span);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(label);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$2.name, type: "if", source: "(293:12) {#if $loggedIn}", ctx });
    	return block;
    }

    // (291:8) {#each images as item}
    function create_each_block$1(ctx) {
    	var div, t0, figure, img, img_src_value, t1, dispose;

    	var if_block = (ctx.$loggedIn) && create_if_block_1$2(ctx);

    	function click_handler_3() {
    		return ctx.click_handler_3(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			figure = element("figure");
    			img = element("img");
    			t1 = space();
    			attr_dev(img, "src", img_src_value = ctx.thumbnailToURL(ctx.item.thumbnail));
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-vwvw8z");
    			add_location(img, file$7, 308, 14, 7310);
    			attr_dev(figure, "class", "svelte-vwvw8z");
    			add_location(figure, file$7, 307, 12, 7228);
    			attr_dev(div, "class", "gi svelte-vwvw8z");
    			add_location(div, file$7, 291, 10, 6670);
    			dispose = listen_dev(figure, "click", click_handler_3);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, figure);
    			append_dev(figure, img);
    			append_dev(div, t1);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (ctx.$loggedIn) {
    				if (!if_block) {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.images) && img_src_value !== (img_src_value = ctx.thumbnailToURL(ctx.item.thumbnail))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(291:8) {#each images as item}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var div;

    	function select_block_type(changed, ctx) {
    		if (ctx.images.length == 0) return create_if_block$2;
    		return create_else_block$2;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$7, 240, 0, 5157);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    let offset = 0;

    let IMAGE_URL = "//dev.himalayanacademy.com/hamsa-images";

    function instance$5($$self, $$props, $$invalidate) {
    	let $loggedIn;

    	validate_store(loggedIn, 'loggedIn');
    	component_subscribe($$self, loggedIn, $$value => { $loggedIn = $$value; $$invalidate('$loggedIn', $loggedIn); });

    	

      let description = "";
      let images = [];
      let collection = "home";
      let collectionThumb = false;
      let selectedImages = new Set();

      const selectImage = checksum => {
        selectedImages.add(checksum);
      };

      const unselectImage = checksum => {
        selectedImages.delete(checksum);
      };

      const refreshCollection = data => {
        let opts = {};
        $$invalidate('images', images = []);
        $$invalidate('collectionThumb', collectionThumb = false);
        $$invalidate('description', description = "");

        if (!data) {
          return false;
        }

        opts = { limit: 50, offset };

        if (data.collection && data.collection !== "home") {
          let keyword = `Collection ${data.collection}`;
          opts.keyword = keyword;
          $$invalidate('collection', collection = data.collection);
          getDescription(keyword);
          document.title = `HAMSA - collection: ${keyword}`;
        }

        if (data.keyword) {
          opts.keyword = data.keyword;
          $$invalidate('collection', collection = data.keyword);
          getDescription(data.keyword);
          document.title = `HAMSA - tag: ${data.keyword}`;
        }

        if (data.artist) {
          opts.artist = data.artist;
          $$invalidate('collection', collection = data.artist);
          getDescription(data.artist);
          getCollectionThumb(data.artist);
          document.title = `HAMSA - Artist: ${data.artist}`;
        }

        if (data.query) {
          opts.query = data.query;
          $$invalidate('collection', collection = data.query);
          document.title = `HAMSA - Search: ${data.query}`;
        }

        console.dir("getting collection", opts);
        getCollection(opts).then(data => {
          $$invalidate('images', images = data.images);
        });
      };

      const getDescription = k => {
        let key = k
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/\./g, "");

        $$invalidate('description', description = "");

        // fetch(url)
        //   .then(r => {
        //     console.log("collection", r)
        //     if (r.status !== 200) {
        //       throw "";
        //     } else {
        //       return r.text();
        //     }
        //   })
        //   .then(d => (description = marked(d)))
        //   .catch(e => {
        //     description = "";
        //   });
      };

      const getCollectionThumb = k => {
        let key = k
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/\./g, "");
        $$invalidate('collectionThumb', collectionThumb = `//dev.himalayanacademy.com/hamsa-images/_artists/${key}.jpg`);
      };

      const thumbnailToURL = t => {
        let i = t.replace("/images/", "");
        return `${IMAGE_URL}/${i}`;
      };

      const unsub = currentView.subscribe(i => {
        if (i.view == "Collection") {
          console.dir("view changed", i);
          refreshCollection(i.data);
        }
      });

      onDestroy(() => unsub());

    	const click_handler = () => {
    	                go('CollectionEditor', { images: [...selectedImages] });
    	              };

    	const error_handler = () => ($$invalidate('collectionThumb', collectionThumb = false));

    	const click_handler_1 = () => {
    	              go('CollectionEditor', { images: [...selectedImages] });
    	            };

    	const click_handler_2 = ({ item }, ev) => {
    	                    if (ev.target.checked) {
    	                      selectImage(item.checksum);
    	                    } else {
    	                      unselectImage(item.checksum);
    	                    }
    	                    console.log(selectedImages);
    	                  };

    	const click_handler_3 = ({ item }) => go('Image', { checksum: item.checksum });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('offset' in $$props) offset = $$props.offset;
    		if ('images' in $$props) $$invalidate('images', images = $$props.images);
    		if ('collection' in $$props) $$invalidate('collection', collection = $$props.collection);
    		if ('collectionThumb' in $$props) $$invalidate('collectionThumb', collectionThumb = $$props.collectionThumb);
    		if ('selectedImages' in $$props) $$invalidate('selectedImages', selectedImages = $$props.selectedImages);
    		if ('IMAGE_URL' in $$props) IMAGE_URL = $$props.IMAGE_URL;
    		if ('$loggedIn' in $$props) loggedIn.set($loggedIn);
    	};

    	return {
    		description,
    		images,
    		collection,
    		collectionThumb,
    		selectedImages,
    		selectImage,
    		unselectImage,
    		thumbnailToURL,
    		console,
    		$loggedIn,
    		click_handler,
    		error_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	};
    }

    class Collection extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Collection", options, id: create_fragment$7.name });
    	}
    }

    /* src\Image.svelte generated by Svelte v3.12.1 */
    const { console: console_1$1 } = globals;

    const file$8 = "src\\Image.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.more = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tag = list[i];
    	return child_ctx;
    }

    // (109:0) {:else}
    function create_else_block$3(ctx) {
    	var div7, div6, div0, img, img_src_value, img_alt_value, t0, a, t1, a_href_value, a_download_value, t2, p, t3_value = ctx.image.metadata.description + "", t3, t4, t5, div5, div1, i, t6, h20, t7_value = ctx.image.metadata.artist + "", t7, t8, div2, t9, div3, h21, t11, t12, div4, t13, h3, t15, t16, div8, span, dispose;

    	var if_block = (ctx.image.metadata.notes.length > 2) && create_if_block_1$3(ctx);

    	let each_value_1 = ctx.image.metadata.keywords;

    	let each_blocks_1 = [];

    	for (let i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    		each_blocks_1[i_1] = create_each_block_1(get_each_context_1(ctx, each_value_1, i_1));
    	}

    	let each_value = ctx.image.metadata.more;

    	let each_blocks = [];

    	for (let i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block$2(get_each_context$2(ctx, each_value, i_1));
    	}

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			a = element("a");
    			t1 = text("Download this image");
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			div5 = element("div");
    			div1 = element("div");
    			i = element("i");
    			t6 = space();
    			h20 = element("h2");
    			t7 = text(t7_value);
    			t8 = space();
    			div2 = element("div");
    			t9 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Tags";
    			t11 = space();

    			for (let i_1 = 0; i_1 < each_blocks_1.length; i_1 += 1) {
    				each_blocks_1[i_1].c();
    			}

    			t12 = space();
    			div4 = element("div");
    			t13 = space();
    			h3 = element("h3");
    			h3.textContent = "More by the same artist";
    			t15 = space();

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			t16 = space();
    			div8 = element("div");
    			span = element("span");
    			span.textContent = "ॐ";
    			attr_dev(img, "src", img_src_value = ctx.toImageURL(ctx.image.medpath));
    			attr_dev(img, "alt", img_alt_value = ctx.image.metadata.description);
    			add_location(img, file$8, 112, 8, 2220);
    			attr_dev(a, "href", a_href_value = ctx.toImageURL(ctx.image.path));
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "download", a_download_value = ctx.toFilename(ctx.image.path));
    			attr_dev(a, "class", "single-image-link svelte-yjmd90");
    			add_location(a, file$8, 113, 8, 2302);
    			attr_dev(p, "class", "description svelte-yjmd90");
    			add_location(p, file$8, 120, 8, 2510);
    			attr_dev(div0, "class", "single-image");
    			add_location(div0, file$8, 111, 6, 2184);
    			attr_dev(i, "class", "far fa-user fa-lg");
    			add_location(i, file$8, 130, 10, 2900);
    			add_location(h20, file$8, 131, 10, 2943);
    			attr_dev(div1, "class", "author svelte-yjmd90");
    			add_location(div1, file$8, 127, 8, 2777);
    			attr_dev(div2, "class", "dotted");
    			add_location(div2, file$8, 133, 8, 3001);
    			add_location(h21, file$8, 135, 10, 3063);
    			attr_dev(div3, "class", "tags");
    			add_location(div3, file$8, 134, 8, 3033);
    			attr_dev(div4, "class", "dotted");
    			add_location(div4, file$8, 144, 8, 3327);
    			add_location(h3, file$8, 145, 8, 3359);
    			attr_dev(div5, "class", "metadata");
    			add_location(div5, file$8, 126, 6, 2745);
    			attr_dev(div6, "class", "single-image-wrapper svelte-yjmd90");
    			add_location(div6, file$8, 110, 4, 2142);
    			attr_dev(div7, "class", "image-view-container svelte-yjmd90");
    			add_location(div7, file$8, 109, 2, 2102);
    			add_location(span, file$8, 162, 4, 3837);
    			attr_dev(div8, "class", "aum-glyph svelte-yjmd90");
    			add_location(div8, file$8, 156, 2, 3668);

    			dispose = [
    				listen_dev(div1, "click", ctx.click_handler),
    				listen_dev(div8, "click", ctx.click_handler_3)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, a);
    			append_dev(a, t1);
    			append_dev(div0, t2);
    			append_dev(div0, p);
    			append_dev(p, t3);
    			append_dev(div0, t4);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div1, i);
    			append_dev(div1, t6);
    			append_dev(div1, h20);
    			append_dev(h20, t7);
    			append_dev(div5, t8);
    			append_dev(div5, div2);
    			append_dev(div5, t9);
    			append_dev(div5, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t11);

    			for (let i_1 = 0; i_1 < each_blocks_1.length; i_1 += 1) {
    				each_blocks_1[i_1].m(div3, null);
    			}

    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			append_dev(div5, t13);
    			append_dev(div5, h3);
    			append_dev(div5, t15);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(div5, null);
    			}

    			insert_dev(target, t16, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, span);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.image) && img_src_value !== (img_src_value = ctx.toImageURL(ctx.image.medpath))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((changed.image) && img_alt_value !== (img_alt_value = ctx.image.metadata.description)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((changed.image) && a_href_value !== (a_href_value = ctx.toImageURL(ctx.image.path))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((changed.image) && a_download_value !== (a_download_value = ctx.toFilename(ctx.image.path))) {
    				attr_dev(a, "download", a_download_value);
    			}

    			if ((changed.image) && t3_value !== (t3_value = ctx.image.metadata.description + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if (ctx.image.metadata.notes.length > 2) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_1$3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if ((changed.image) && t7_value !== (t7_value = ctx.image.metadata.artist + "")) {
    				set_data_dev(t7, t7_value);
    			}

    			if (changed.image) {
    				each_value_1 = ctx.image.metadata.keywords;

    				let i_1;
    				for (i_1 = 0; i_1 < each_value_1.length; i_1 += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i_1);

    					if (each_blocks_1[i_1]) {
    						each_blocks_1[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i_1] = create_each_block_1(child_ctx);
    						each_blocks_1[i_1].c();
    						each_blocks_1[i_1].m(div3, null);
    					}
    				}

    				for (; i_1 < each_blocks_1.length; i_1 += 1) {
    					each_blocks_1[i_1].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.toThumbnail || changed.image) {
    				each_value = ctx.image.metadata.more;

    				let i_1;
    				for (i_1 = 0; i_1 < each_value.length; i_1 += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block$2(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(div5, null);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div7);
    			}

    			if (if_block) if_block.d();

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(t16);
    				detach_dev(div8);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$3.name, type: "else", source: "(109:0) {:else}", ctx });
    	return block;
    }

    // (105:0) {#if loading}
    function create_if_block$3(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$8, 106, 4, 2038);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$8, 105, 2, 2003);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(105:0) {#if loading}", ctx });
    	return block;
    }

    // (122:8) {#if image.metadata.notes.length > 2}
    function create_if_block_1$3(ctx) {
    	var h3, t1, p, t2_value = ctx.image.metadata.notes + "", t2;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "About This Art";
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			add_location(h3, file$8, 122, 10, 2624);
    			attr_dev(p, "class", "description svelte-yjmd90");
    			add_location(p, file$8, 123, 10, 2659);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.image) && t2_value !== (t2_value = ctx.image.metadata.notes + "")) {
    				set_data_dev(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h3);
    				detach_dev(t1);
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$3.name, type: "if", source: "(122:8) {#if image.metadata.notes.length > 2}", ctx });
    	return block;
    }

    // (137:10) {#each image.metadata.keywords as tag}
    function create_each_block_1(ctx) {
    	var span, t0_value = ctx.tag + "", t0, t1, dispose;

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(span, "class", "tag svelte-yjmd90");
    			add_location(span, file$8, 137, 12, 3140);
    			dispose = listen_dev(span, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.image) && t0_value !== (t0_value = ctx.tag + "")) {
    				set_data_dev(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(137:10) {#each image.metadata.keywords as tag}", ctx });
    	return block;
    }

    // (147:8) {#each image.metadata.more as more}
    function create_each_block$2(ctx) {
    	var img, img_src_value, dispose;

    	function click_handler_2() {
    		return ctx.click_handler_2(ctx);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "src", img_src_value = ctx.toThumbnail(ctx.more));
    			attr_dev(img, "alt", "more");
    			attr_dev(img, "class", "more-images svelte-yjmd90");
    			add_location(img, file$8, 147, 10, 3448);
    			dispose = listen_dev(img, "click", click_handler_2);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.image) && img_src_value !== (img_src_value = ctx.toThumbnail(ctx.more))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(img);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(147:8) {#each image.metadata.more as more}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var if_block_anchor;

    	function select_block_type(changed, ctx) {
    		if (ctx.loading) return create_if_block$3;
    		return create_else_block$3;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    let IMAGE_URL$1 = "//dev.himalayanacademy.com/hamsa-images";

    function instance$6($$self, $$props, $$invalidate) {
    	

      let { checksum } = $$props;

      let image = {};
      let loading = true;

      const refreshImage = data => {
        let checksum = data.checksum;
        $$invalidate('loading', loading = true);
        getImage({ checksum }).then(res => {
          $$invalidate('image', image = res.image);
          $$invalidate('loading', loading = false);
        });
      };

      const toFilename = path => {
        return "image.jpg";
      };

      const toImageURL = url => {
        let i = url
          .replace("/images/", "")
          .replace("/home/devhap/public_html/hamsa-images", "");
        return `${IMAGE_URL$1}/${i}`;
      };

      const toThumbnail = checksum => {
        return `${IMAGE_URL$1}/_cache/${checksum}.thumb.jpg`;
      };

      const unsub = currentView.subscribe(i => {
        console.dir("view changed", i);
        if (i.view == "Image") {
          refreshImage(i.data);
        }
      });

      onDestroy(() => unsub());

    	const writable_props = ['checksum'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$1.warn(`<Image> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => go('Collection', { artist: image.metadata.artist });

    	const click_handler_1 = ({ tag }) => go('Collection', { keyword: tag });

    	const click_handler_2 = ({ more }) => go('Image', { checksum: more });

    	const click_handler_3 = () => {
    	      console.log('checksum', image.checksum);
    	      go('ImageEditor', { checksum: image.checksum });
    	    };

    	$$self.$set = $$props => {
    		if ('checksum' in $$props) $$invalidate('checksum', checksum = $$props.checksum);
    	};

    	$$self.$capture_state = () => {
    		return { checksum, image, loading, IMAGE_URL: IMAGE_URL$1 };
    	};

    	$$self.$inject_state = $$props => {
    		if ('checksum' in $$props) $$invalidate('checksum', checksum = $$props.checksum);
    		if ('image' in $$props) $$invalidate('image', image = $$props.image);
    		if ('loading' in $$props) $$invalidate('loading', loading = $$props.loading);
    		if ('IMAGE_URL' in $$props) IMAGE_URL$1 = $$props.IMAGE_URL;
    	};

    	return {
    		checksum,
    		image,
    		loading,
    		toFilename,
    		toImageURL,
    		toThumbnail,
    		console,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	};
    }

    class Image extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$8, safe_not_equal, ["checksum"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Image", options, id: create_fragment$8.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.checksum === undefined && !('checksum' in props)) {
    			console_1$1.warn("<Image> was created without expected prop 'checksum'");
    		}
    	}

    	get checksum() {
    		throw new Error("<Image>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checksum(value) {
    		throw new Error("<Image>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ImageEditor.svelte generated by Svelte v3.12.1 */
    const { console: console_1$2 } = globals;

    const file$9 = "src\\ImageEditor.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.collection = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tag = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.tag = list[i];
    	return child_ctx;
    }

    // (320:0) {#if error}
    function create_if_block_4$1(ctx) {
    	var p, t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(ctx.error);
    			attr_dev(p, "class", "error svelte-15vqd64");
    			add_location(p, file$9, 320, 2, 7912);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},

    		p: function update(changed, ctx) {
    			if (changed.error) {
    				set_data_dev(t, ctx.error);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4$1.name, type: "if", source: "(320:0) {#if error}", ctx });
    	return block;
    }

    // (337:0) {:else}
    function create_else_block$4(ctx) {
    	var div6, div5, div0, img, img_src_value, img_alt_value, t0, t1, div4, div1, i, t2, h20, t3_value = ctx.image.metadata.artist + "", t3, t4, div2, t5, div3, h21, t7, t8, br0, t9, br1, t10, dispose;

    	function select_block_type_1(changed, ctx) {
    		if (!ctx.updatingText) return create_if_block_3$1;
    		return create_else_block_2;
    	}

    	var current_block_type = select_block_type_1(null, ctx);
    	var if_block0 = current_block_type(ctx);

    	let each_value_2 = ctx.image.metadata.keywords;

    	let each_blocks = [];

    	for (let i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
    		each_blocks[i_1] = create_each_block_2(get_each_context_2(ctx, each_value_2, i_1));
    	}

    	function select_block_type_2(changed, ctx) {
    		if (ctx.addingTag) return create_if_block_2$1;
    		return create_else_block_1$1;
    	}

    	var current_block_type_1 = select_block_type_2(null, ctx);
    	var if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			i = element("i");
    			t2 = space();
    			h20 = element("h2");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = space();
    			div3 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Tags";
    			t7 = space();

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].c();
    			}

    			t8 = space();
    			br0 = element("br");
    			t9 = space();
    			br1 = element("br");
    			t10 = space();
    			if_block1.c();
    			attr_dev(img, "src", img_src_value = ctx.toImageURL(ctx.image.medpath));
    			attr_dev(img, "alt", img_alt_value = ctx.image.metadata.description);
    			add_location(img, file$9, 340, 8, 8559);
    			attr_dev(div0, "class", "single-image");
    			add_location(div0, file$9, 339, 6, 8523);
    			attr_dev(i, "class", "far fa-user fa-lg");
    			add_location(i, file$9, 373, 10, 9779);
    			add_location(h20, file$9, 374, 10, 9822);
    			attr_dev(div1, "class", "author svelte-15vqd64");
    			add_location(div1, file$9, 370, 8, 9656);
    			attr_dev(div2, "class", "dotted");
    			add_location(div2, file$9, 376, 8, 9880);
    			add_location(h21, file$9, 378, 10, 9942);
    			add_location(br0, file$9, 387, 10, 10217);
    			add_location(br1, file$9, 388, 10, 10235);
    			attr_dev(div3, "class", "tags");
    			add_location(div3, file$9, 377, 8, 9912);
    			attr_dev(div4, "class", "metadata");
    			add_location(div4, file$9, 369, 6, 9624);
    			attr_dev(div5, "class", "single-image-wrapper svelte-15vqd64");
    			add_location(div5, file$9, 338, 4, 8481);
    			attr_dev(div6, "class", "image-view-container svelte-15vqd64");
    			add_location(div6, file$9, 337, 2, 8441);
    			dispose = listen_dev(div1, "click", ctx.click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			if_block0.m(div0, null);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, i);
    			append_dev(div1, t2);
    			append_dev(div1, h20);
    			append_dev(h20, t3);
    			append_dev(div4, t4);
    			append_dev(div4, div2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, h21);
    			append_dev(div3, t7);

    			for (let i_1 = 0; i_1 < each_blocks.length; i_1 += 1) {
    				each_blocks[i_1].m(div3, null);
    			}

    			append_dev(div3, t8);
    			append_dev(div3, br0);
    			append_dev(div3, t9);
    			append_dev(div3, br1);
    			append_dev(div3, t10);
    			if_block1.m(div3, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.image) && img_src_value !== (img_src_value = ctx.toImageURL(ctx.image.medpath))) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((changed.image) && img_alt_value !== (img_alt_value = ctx.image.metadata.description)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(changed, ctx)) && if_block0) {
    				if_block0.p(changed, ctx);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);
    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if ((changed.image) && t3_value !== (t3_value = ctx.image.metadata.artist + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if (changed.image) {
    				each_value_2 = ctx.image.metadata.keywords;

    				let i_1;
    				for (i_1 = 0; i_1 < each_value_2.length; i_1 += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i_1);

    					if (each_blocks[i_1]) {
    						each_blocks[i_1].p(changed, child_ctx);
    					} else {
    						each_blocks[i_1] = create_each_block_2(child_ctx);
    						each_blocks[i_1].c();
    						each_blocks[i_1].m(div3, t8);
    					}
    				}

    				for (; i_1 < each_blocks.length; i_1 += 1) {
    					each_blocks[i_1].d(1);
    				}
    				each_blocks.length = each_value_2.length;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_2(changed, ctx)) && if_block1) {
    				if_block1.p(changed, ctx);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div6);
    			}

    			if_block0.d();

    			destroy_each(each_blocks, detaching);

    			if_block1.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$4.name, type: "else", source: "(337:0) {:else}", ctx });
    	return block;
    }

    // (333:18) 
    function create_if_block_1$4(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$9, 334, 4, 8377);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$9, 333, 2, 8342);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$4.name, type: "if", source: "(333:18) ", ctx });
    	return block;
    }

    // (323:0) {#if !loggedIn}
    function create_if_block$4(ctx) {
    	var p, t1, form, label0, t3, input0, t4, label1, t6, input1, t7, br, t8, input2, dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please log in.";
    			t1 = space();
    			form = element("form");
    			label0 = element("label");
    			label0.textContent = "Email:";
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			label1.textContent = "Password:";
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			br = element("br");
    			t8 = space();
    			input2 = element("input");
    			add_location(p, file$9, 323, 2, 7968);
    			attr_dev(label0, "for", "email");
    			add_location(label0, file$9, 325, 4, 8049);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "email");
    			add_location(input0, file$9, 326, 4, 8088);
    			attr_dev(label1, "for", "password");
    			add_location(label1, file$9, 327, 4, 8145);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "id", "password");
    			add_location(input1, file$9, 328, 4, 8190);
    			add_location(br, file$9, 329, 4, 8257);
    			attr_dev(input2, "type", "submit");
    			input2.value = "log in";
    			add_location(input2, file$9, 330, 4, 8269);
    			add_location(form, file$9, 324, 2, 7993);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(input1, "input", ctx.input1_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.testAndSaveLogin), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(form, t3);
    			append_dev(form, input0);

    			set_input_value(input0, ctx.email);

    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(form, t6);
    			append_dev(form, input1);

    			set_input_value(input1, ctx.password);

    			append_dev(form, t7);
    			append_dev(form, br);
    			append_dev(form, t8);
    			append_dev(form, input2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.email && (input0.value !== ctx.email)) set_input_value(input0, ctx.email);
    			if (changed.password && (input1.value !== ctx.password)) set_input_value(input1, ctx.password);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(p);
    				detach_dev(t1);
    				detach_dev(form);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$4.name, type: "if", source: "(323:0) {#if !loggedIn}", ctx });
    	return block;
    }

    // (364:8) {:else}
    function create_else_block_2(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$9, 365, 12, 9528);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$9, 364, 10, 9485);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_2.name, type: "else", source: "(364:8) {:else}", ctx });
    	return block;
    }

    // (342:8) {#if !updatingText}
    function create_if_block_3$1(ctx) {
    	var form, label0, t0, i0, t2, textarea0, t3, input0, t4, label1, t5, i1, t7, textarea1, t8, input1, dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			label0 = element("label");
    			t0 = text("Description\r\n              ");
    			i0 = element("i");
    			i0.textContent = "(IPTC:Caption-Abstract, EXIF:ImageDescription and\r\n                XMP:Description)";
    			t2 = space();
    			textarea0 = element("textarea");
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			label1 = element("label");
    			t5 = text("About the image\r\n              ");
    			i1 = element("i");
    			i1.textContent = "(IPTC:DocumentNotes)";
    			t7 = space();
    			textarea1 = element("textarea");
    			t8 = space();
    			input1 = element("input");
    			add_location(i0, file$9, 345, 14, 8760);
    			attr_dev(label0, "for", "description");
    			add_location(label0, file$9, 343, 12, 8692);
    			attr_dev(textarea0, "rows", "10");
    			attr_dev(textarea0, "name", "description");
    			attr_dev(textarea0, "class", "description svelte-15vqd64");
    			add_location(textarea0, file$9, 350, 12, 8920);
    			attr_dev(input0, "type", "button");
    			input0.value = "Save Description";
    			add_location(input0, file$9, 355, 12, 9080);
    			add_location(i1, file$9, 358, 14, 9237);
    			attr_dev(label1, "for", "notes");
    			add_location(label1, file$9, 356, 12, 9171);
    			attr_dev(textarea1, "name", "notes");
    			attr_dev(textarea1, "class", "notes svelte-15vqd64");
    			add_location(textarea1, file$9, 360, 12, 9300);
    			attr_dev(input1, "type", "button");
    			input1.value = "Save Notes";
    			add_location(input1, file$9, 361, 12, 9372);
    			add_location(form, file$9, 342, 10, 8672);

    			dispose = [
    				listen_dev(textarea0, "input", ctx.textarea0_input_handler),
    				listen_dev(input0, "click", ctx.updateDescription),
    				listen_dev(textarea1, "input", ctx.textarea1_input_handler),
    				listen_dev(input1, "click", ctx.updateNotes)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label0);
    			append_dev(label0, t0);
    			append_dev(label0, i0);
    			append_dev(form, t2);
    			append_dev(form, textarea0);

    			set_input_value(textarea0, ctx.description);

    			append_dev(form, t3);
    			append_dev(form, input0);
    			append_dev(form, t4);
    			append_dev(form, label1);
    			append_dev(label1, t5);
    			append_dev(label1, i1);
    			append_dev(form, t7);
    			append_dev(form, textarea1);

    			set_input_value(textarea1, ctx.notes);

    			append_dev(form, t8);
    			append_dev(form, input1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.description) set_input_value(textarea0, ctx.description);
    			if (changed.notes) set_input_value(textarea1, ctx.notes);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(form);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3$1.name, type: "if", source: "(342:8) {#if !updatingText}", ctx });
    	return block;
    }

    // (380:10) {#each image.metadata.keywords as tag}
    function create_each_block_2(ctx) {
    	var span, t0_value = ctx.tag + "", t0, t1, dispose;

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(" | x");
    			attr_dev(span, "tooltip", "click to delete");
    			attr_dev(span, "class", "tag svelte-15vqd64");
    			add_location(span, file$9, 380, 12, 10019);
    			dispose = listen_dev(span, "click", click_handler_1);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.image) && t0_value !== (t0_value = ctx.tag + "")) {
    				set_data_dev(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(380:10) {#each image.metadata.keywords as tag}", ctx });
    	return block;
    }

    // (394:10) {:else}
    function create_else_block_1$1(ctx) {
    	var form, label, t1, select, t2, input, t3, h2, t5, dispose;

    	let each_value_1 = ctx.tags;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = ctx.collections;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			label = element("label");
    			label.textContent = "Add Tag:";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			input = element("input");
    			t3 = space();
    			h2 = element("h2");
    			h2.textContent = "Collections";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(label, "for", "newtag");
    			add_location(label, file$9, 395, 14, 10447);
    			if (ctx.newTag === void 0) add_render_callback(() => ctx.select_change_handler.call(select));
    			add_location(select, file$9, 396, 14, 10499);
    			attr_dev(input, "type", "submit");
    			input.value = "Assign tag";
    			add_location(input, file$9, 401, 14, 10684);
    			add_location(h2, file$9, 402, 14, 10742);
    			add_location(form, file$9, 394, 12, 10391);

    			dispose = [
    				listen_dev(select, "change", ctx.select_change_handler),
    				listen_dev(form, "submit", prevent_default(ctx.addTag), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, ctx.newTag);

    			append_dev(form, t2);
    			append_dev(form, input);
    			append_dev(form, t3);
    			append_dev(form, h2);
    			append_dev(form, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(form, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.tags) {
    				each_value_1 = ctx.tags;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.newTag) select_option(select, ctx.newTag);

    			if (changed.collections || changed.activeCollections) {
    				each_value = ctx.collections;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(form, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(form);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1$1.name, type: "else", source: "(394:10) {:else}", ctx });
    	return block;
    }

    // (390:10) {#if addingTag}
    function create_if_block_2$1(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin");
    			add_location(i, file$9, 391, 14, 10303);
    			add_location(div, file$9, 390, 12, 10282);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(390:10) {#if addingTag}", ctx });
    	return block;
    }

    // (398:16) {#each tags as tag}
    function create_each_block_1$1(ctx) {
    	var option, t_value = ctx.tag + "", t, option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = ctx.tag;
    			option.value = option.__value;
    			add_location(option, file$9, 398, 18, 10584);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.tags) && t_value !== (t_value = ctx.tag + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.tags) && option_value_value !== (option_value_value = ctx.tag)) {
    				prop_dev(option, "__value", option_value_value);
    			}

    			option.value = option.__value;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(option);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(398:16) {#each tags as tag}", ctx });
    	return block;
    }

    // (404:14) {#each collections as collection, i}
    function create_each_block$3(ctx) {
    	var div, input, t0, label, t1_value = ctx.collection + "", t1, t2, dispose;

    	function input_change_handler() {
    		ctx.input_change_handler.call(input, ctx);
    	}

    	function change_handler(...args) {
    		return ctx.change_handler(ctx, ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", "collection-" + ctx.i);
    			add_location(input, file$9, 405, 18, 10857);
    			attr_dev(label, "class", "collection-label svelte-15vqd64");
    			attr_dev(label, "for", "collection-" + ctx.i);
    			add_location(label, file$9, 410, 18, 11098);
    			add_location(div, file$9, 404, 16, 10832);

    			dispose = [
    				listen_dev(input, "change", input_change_handler),
    				listen_dev(input, "change", change_handler)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);

    			input.checked = ctx.activeCollections[ctx.i];

    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			append_dev(div, t2);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if (changed.activeCollections) input.checked = ctx.activeCollections[ctx.i];

    			if ((changed.collections) && t1_value !== (t1_value = ctx.collection + "")) {
    				set_data_dev(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(404:14) {#each collections as collection, i}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var div, h3, t1, t2, if_block1_anchor;

    	var if_block0 = (ctx.error) && create_if_block_4$1(ctx);

    	function select_block_type(changed, ctx) {
    		if (!ctx.loggedIn) return create_if_block$4;
    		if (ctx.loading) return create_if_block_1$4;
    		return create_else_block$4;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Image Editor";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if_block1.c();
    			if_block1_anchor = empty();
    			attr_dev(h3, "class", "collection-title svelte-15vqd64");
    			add_location(h3, file$9, 317, 2, 7841);
    			attr_dev(div, "class", "collection-header svelte-15vqd64");
    			add_location(div, file$9, 316, 0, 7806);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			insert_dev(target, t1, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t2, anchor);
    			if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.error) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_4$1(ctx);
    					if_block0.c();
    					if_block0.m(t2.parentNode, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block1) {
    				if_block1.p(changed, ctx);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);
    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				detach_dev(t1);
    			}

    			if (if_block0) if_block0.d(detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			if_block1.d(detaching);

    			if (detaching) {
    				detach_dev(if_block1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    let IMAGE_URL$2 = "//dev.himalayanacademy.com/hamsa-images";

    function instance$7($$self, $$props, $$invalidate) {
    	

      // problem with f3a129ffe45a292771e1e15e4c0ecd45
      /*
      check sum changes with editing, need to take that into account.
      */

      let { checksum } = $$props;

      let image = {};
      let loading = true;
      let addingTag = false;
      let updatingText = false;
      let error = false;
      let email;
      let password;
      let loggedIn = false;
      let newTag;
      let notes = "";
      let description = "";

      const savedCredentials = () => {
        if (
          sessionStorage.getItem("email") !== null &&
          sessionStorage.getItem("password") !== null
        ) {
          $$invalidate('email', email = sessionStorage.getItem("email"));
          $$invalidate('password', password = sessionStorage.getItem("password"));
          return true;
        } else {
          return false;
        }
      };

      const refreshImage = data => {
        $$invalidate('checksum', checksum = data.checksum);
        $$invalidate('loading', loading = true);
        getImage({ checksum }).then(res => {
          $$invalidate('image', image = res.image);
          $$invalidate('activeCollections', activeCollections = collections.map(c =>
            image.metadata.keywords.includes(`Collection ${c}`)
          ));
          if (image.metadata.description.length > 0) {
            $$invalidate('description', description = image.metadata.description);
          }

          if (image.metadata.notes.length > 0) {
            $$invalidate('notes', notes = image.metadata.notes);
          }

          $$invalidate('loading', loading = false);
        });
      };

      const testAndSaveLogin = async () => {
        if (await login(email, password)) {
          console.log(`user ${email} logged in.`);
          sessionStorage.setItem("email", email);
          sessionStorage.setItem("password", password);
          $$invalidate('error', error = false);
          $$invalidate('loggedIn', loggedIn = true);
        } else {
          console.log(`Bad login credentials.`);
          sessionStorage.removeItem("email");
          sessionStorage.removeItem("password");
          $$invalidate('error', error = "Not a valid user.");
          $$invalidate('loggedIn', loggedIn = false);
        }
      };

      const toImageURL = url => {
        let i = url
          .replace("/images/", "")
          .replace("/home/devhap/public_html/hamsa-images", "");
        return `${IMAGE_URL$2}/${i}`;
      };

      const updateCollection = (ev, c, i) => {
        if (ev.target.checked) {
          $$invalidate('newTag', newTag = `Collection ${c}`);
          addTag();
        } else {
          let tag = `Collection ${c}`;
          deleteTag(tag);
        }
      };

      const deleteTag = tag => {
        if (confirm(`Do you want to remove tag: "${tag}" ?`)) {
          console.log("remove tag", tag);

          $$invalidate('addingTag', addingTag = true);

          let res = removeImageTag(email, password, checksum, tag)
            .then(res => {
              console.log(res);
              $$invalidate('image', image = res.removeImageTag);
              $$invalidate('checksum', checksum = image.checksum);
              console.log("new checksum", checksum);
              $$invalidate('addingTag', addingTag = false);
              history.replaceState(
                { checksum },
                `Editing Image: ${checksum}`,
                `${location.pathname}?checksum=${checksum}&view=ImageEditor`
              );
            })
            .catch(n => {
              console.error(n);
              $$invalidate('error', error = n.map(e => e.message).join(`. `));
              $$invalidate('addingTag', addingTag = false);
            });
        }
      };

      const addTag = () => {
        if (newTag.length <= 2) {
          alert("Can't add tags that short.");
          return false;
        }

        $$invalidate('addingTag', addingTag = true);

        let res = addImageTag(email, password, checksum, newTag)
          .then(res => {
            console.log(res);
            $$invalidate('image', image = res.addImageTag);
            $$invalidate('checksum', checksum = image.checksum);
            console.log("new checksum", checksum);
            $$invalidate('addingTag', addingTag = false);

            if (newTag.indexOf("Collection") !== -1) {
              $$invalidate('addingTag', addingTag = true);
              getSelectors().then(selectors => {
                $$invalidate('tags', tags = selectors.keywords);
                $$invalidate('collections', collections = selectors.collections);
                refreshImage({ checksum });
                $$invalidate('addingTag', addingTag = false);
              });
            }

            $$invalidate('newTag', newTag = "");
            history.replaceState(
              { checksum },
              `Editing Image: ${checksum}`,
              `${location.pathname}?checksum=${checksum}&view=ImageEditor`
            );
          })
          .catch(n => {
            console.error(n);
            $$invalidate('error', error = n.map(e => e.message).join(`. `));
            $$invalidate('addingTag', addingTag = false);
          });
      };

      const updateNotes = () => {
        if (image.metadata.notes !== notes) {
          $$invalidate('updatingText', updatingText = true);
          if (notes === "") {
            $$invalidate('notes', notes = " ");
            // notes can't be mutated to empty, it causes an error down in exiftool.
          }
          setImageNotes(email, password, checksum, notes)
            .then(res => {
              console.log(res);
              $$invalidate('image', image = res.setImageNotes);
              $$invalidate('checksum', checksum = image.checksum);
              console.log("new checksum", checksum);
              $$invalidate('updatingText', updatingText = false);
              history.replaceState(
                { checksum },
                `Editing Image: ${checksum}`,
                `${location.pathname}?checksum=${checksum}&view=ImageEditor`
              );
            })
            .catch(n => {
              console.error(n);
              $$invalidate('error', error = n.map(e => e.message).join(`. `));
              $$invalidate('updatingText', updatingText = false);
            });
        }
      };

      const updateDescription = () => {
        if (image.metadata.description !== description) {
          $$invalidate('updatingText', updatingText = true);
          setImageDescription(email, password, checksum, description)
            .then(res => {
              console.log(res);
              $$invalidate('image', image = res.setImageDescription);
              $$invalidate('checksum', checksum = image.checksum);
              console.log("new checksum", checksum);
              $$invalidate('updatingText', updatingText = false);
              history.replaceState(
                { checksum },
                `Editing Image: ${checksum}`,
                `${location.pathname}?checksum=${checksum}&view=ImageEditor`
              );
            })
            .catch(n => {
              console.error(n);
              $$invalidate('error', error = n.map(e => e.message).join(`. `));
              $$invalidate('updatingText', updatingText = false);
            });
        }
      };

      $$invalidate('loggedIn', loggedIn = savedCredentials());
      let collections;
      let activeCollections;
      let tags;

      const unsub = currentView.subscribe(i => {
        console.dir("view changed", i);
        if (i.view == "ImageEditor") {
          getSelectors().then(selectors => {
            $$invalidate('tags', tags = selectors.keywords.sort());
            $$invalidate('collections', collections = selectors.collections);
            refreshImage(i.data);
          });
        }
      });

      onDestroy(() => unsub());

    	const writable_props = ['checksum'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console_1$2.warn(`<ImageEditor> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate('email', email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate('password', password);
    	}

    	function textarea0_input_handler() {
    		description = this.value;
    		$$invalidate('description', description);
    	}

    	function textarea1_input_handler() {
    		notes = this.value;
    		$$invalidate('notes', notes);
    	}

    	const click_handler = () => go('Collection', { artist: image.metadata.artist });

    	const click_handler_1 = ({ tag }) => deleteTag(tag);

    	function select_change_handler() {
    		newTag = select_value(this);
    		$$invalidate('newTag', newTag);
    		$$invalidate('tags', tags);
    	}

    	function input_change_handler({ i }) {
    		activeCollections[i] = this.checked;
    		$$invalidate('activeCollections', activeCollections);
    	}

    	const change_handler = ({ collection, i }, ev) => updateCollection(ev, collection);

    	$$self.$set = $$props => {
    		if ('checksum' in $$props) $$invalidate('checksum', checksum = $$props.checksum);
    	};

    	$$self.$capture_state = () => {
    		return { checksum, image, loading, addingTag, updatingText, IMAGE_URL: IMAGE_URL$2, error, email, password, loggedIn, newTag, notes, description, collections, activeCollections, tags };
    	};

    	$$self.$inject_state = $$props => {
    		if ('checksum' in $$props) $$invalidate('checksum', checksum = $$props.checksum);
    		if ('image' in $$props) $$invalidate('image', image = $$props.image);
    		if ('loading' in $$props) $$invalidate('loading', loading = $$props.loading);
    		if ('addingTag' in $$props) $$invalidate('addingTag', addingTag = $$props.addingTag);
    		if ('updatingText' in $$props) $$invalidate('updatingText', updatingText = $$props.updatingText);
    		if ('IMAGE_URL' in $$props) IMAGE_URL$2 = $$props.IMAGE_URL;
    		if ('error' in $$props) $$invalidate('error', error = $$props.error);
    		if ('email' in $$props) $$invalidate('email', email = $$props.email);
    		if ('password' in $$props) $$invalidate('password', password = $$props.password);
    		if ('loggedIn' in $$props) $$invalidate('loggedIn', loggedIn = $$props.loggedIn);
    		if ('newTag' in $$props) $$invalidate('newTag', newTag = $$props.newTag);
    		if ('notes' in $$props) $$invalidate('notes', notes = $$props.notes);
    		if ('description' in $$props) $$invalidate('description', description = $$props.description);
    		if ('collections' in $$props) $$invalidate('collections', collections = $$props.collections);
    		if ('activeCollections' in $$props) $$invalidate('activeCollections', activeCollections = $$props.activeCollections);
    		if ('tags' in $$props) $$invalidate('tags', tags = $$props.tags);
    	};

    	return {
    		checksum,
    		image,
    		loading,
    		addingTag,
    		updatingText,
    		error,
    		email,
    		password,
    		loggedIn,
    		newTag,
    		notes,
    		description,
    		testAndSaveLogin,
    		toImageURL,
    		updateCollection,
    		deleteTag,
    		addTag,
    		updateNotes,
    		updateDescription,
    		collections,
    		activeCollections,
    		tags,
    		input0_input_handler,
    		input1_input_handler,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		click_handler,
    		click_handler_1,
    		select_change_handler,
    		input_change_handler,
    		change_handler
    	};
    }

    class ImageEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$9, safe_not_equal, ["checksum"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ImageEditor", options, id: create_fragment$9.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.checksum === undefined && !('checksum' in props)) {
    			console_1$2.warn("<ImageEditor> was created without expected prop 'checksum'");
    		}
    	}

    	get checksum() {
    		throw new Error("<ImageEditor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checksum(value) {
    		throw new Error("<ImageEditor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\CollectionEditor.svelte generated by Svelte v3.12.1 */

    const file$a = "src\\CollectionEditor.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.collection = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.image = list[i];
    	return child_ctx;
    }

    // (173:0) {:else}
    function create_else_block$5(ctx) {
    	var div2, div0, t0, div1, t1;

    	let each_value_1 = ctx.images;

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	var if_block0 = (ctx.collections) && create_if_block_3$2(ctx);

    	var if_block1 = (ctx.tags) && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "images svelte-13nl7d6");
    			add_location(div0, file$a, 174, 4, 3846);
    			attr_dev(div1, "class", "controls svelte-13nl7d6");
    			add_location(div1, file$a, 187, 4, 4199);
    			attr_dev(div2, "class", "editor svelte-13nl7d6");
    			add_location(div2, file$a, 173, 2, 3820);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed.images || changed.thumbnailToURL) {
    				each_value_1 = ctx.images;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}

    			if (ctx.collections) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3$2(ctx);
    					if_block0.c();
    					if_block0.m(div1, t1);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.tags) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_1$5(ctx);
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			destroy_each(each_blocks, detaching);

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$5.name, type: "else", source: "(173:0) {:else}", ctx });
    	return block;
    }

    // (169:0) {#if loadingImages}
    function create_if_block$5(ctx) {
    	var div, i;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin fa-3x");
    			add_location(i, file$a, 170, 4, 3756);
    			attr_dev(div, "class", "loading-wrapper");
    			add_location(div, file$a, 169, 2, 3721);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$5.name, type: "if", source: "(169:0) {#if loadingImages}", ctx });
    	return block;
    }

    // (181:8) {:else}
    function create_else_block_3(ctx) {
    	var figure, img, img_src_value, t;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			img = element("img");
    			t = space();
    			attr_dev(img, "src", img_src_value = ctx.thumbnailToURL(ctx.image.thumbnail));
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-13nl7d6");
    			add_location(img, file$a, 182, 12, 4078);
    			attr_dev(figure, "class", "svelte-13nl7d6");
    			add_location(figure, file$a, 181, 10, 4056);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, img);
    			append_dev(figure, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.images) && img_src_value !== (img_src_value = ctx.thumbnailToURL(ctx.image.thumbnail))) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(figure);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_3.name, type: "else", source: "(181:8) {:else}", ctx });
    	return block;
    }

    // (177:8) {#if typeof image == 'string'}
    function create_if_block_5$1(ctx) {
    	var figure, i, t;

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			i = element("i");
    			t = space();
    			attr_dev(i, "class", "fa fa-spinner fa-spin");
    			add_location(i, file$a, 178, 12, 3971);
    			attr_dev(figure, "class", "svelte-13nl7d6");
    			add_location(figure, file$a, 177, 10, 3949);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, i);
    			append_dev(figure, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(figure);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_5$1.name, type: "if", source: "(177:8) {#if typeof image == 'string'}", ctx });
    	return block;
    }

    // (176:6) {#each images as image}
    function create_each_block_1$2(ctx) {
    	var if_block_anchor;

    	function select_block_type_1(changed, ctx) {
    		if (typeof ctx.image == 'string') return create_if_block_5$1;
    		return create_else_block_3;
    	}

    	var current_block_type = select_block_type_1(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_1(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$2.name, type: "each", source: "(176:6) {#each images as image}", ctx });
    	return block;
    }

    // (189:6) {#if collections}
    function create_if_block_3$2(ctx) {
    	var div, h3, t1, p, t3, t4, if_block_anchor;

    	let each_value = ctx.collections;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	function select_block_type_2(changed, ctx) {
    		if (ctx.addingTag) return create_if_block_4$2;
    		return create_else_block_2$1;
    	}

    	var current_block_type = select_block_type_2(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Collections";
    			t1 = space();
    			p = element("p");
    			p.textContent = "All the collections you select here will be added to the images\r\n            appearing on the left.";
    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h3, "class", "collection-title svelte-13nl7d6");
    			add_location(h3, file$a, 190, 10, 4299);
    			add_location(p, file$a, 191, 10, 4356);
    			attr_dev(div, "class", "collection-header svelte-13nl7d6");
    			add_location(div, file$a, 189, 8, 4256);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, p);
    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t4, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.collections) {
    				each_value = ctx.collections;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t4.parentNode, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type !== (current_block_type = select_block_type_2(changed, ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				detach_dev(t3);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(t4);
    			}

    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3$2.name, type: "if", source: "(189:6) {#if collections}", ctx });
    	return block;
    }

    // (197:8) {#each collections as collection, i}
    function create_each_block$4(ctx) {
    	var div, input, t0, label, t1_value = ctx.collection + "", t1, dispose;

    	function change_handler(...args) {
    		return ctx.change_handler(ctx, ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(t1_value);
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "name", "collection");
    			attr_dev(input, "id", "collection-" + ctx.i);
    			add_location(input, file$a, 198, 12, 4581);
    			attr_dev(label, "class", "collection-label svelte-13nl7d6");
    			attr_dev(label, "for", "collection-" + ctx.i);
    			add_location(label, file$a, 203, 12, 4769);
    			add_location(div, file$a, 197, 10, 4562);
    			dispose = listen_dev(input, "change", change_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.collections) && t1_value !== (t1_value = ctx.collection + "")) {
    				set_data_dev(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(197:8) {#each collections as collection, i}", ctx });
    	return block;
    }

    // (211:8) {:else}
    function create_else_block_2$1(ctx) {
    	var br, t, button, dispose;

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = space();
    			button = element("button");
    			button.textContent = "Assign the selected collections to the images on the left";
    			add_location(br, file$a, 211, 8, 5006);
    			attr_dev(button, "class", "button svelte-13nl7d6");
    			add_location(button, file$a, 212, 10, 5022);
    			dispose = listen_dev(button, "click", ctx.addCollection);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, button, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(br);
    				detach_dev(t);
    				detach_dev(button);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_2$1.name, type: "else", source: "(211:8) {:else}", ctx });
    	return block;
    }

    // (209:8) {#if addingTag}
    function create_if_block_4$2(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin");
    			add_location(i, file$a, 209, 10, 4944);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4$2.name, type: "if", source: "(209:8) {#if addingTag}", ctx });
    	return block;
    }

    // (218:6) {#if tags}
    function create_if_block_1$5(ctx) {
    	var div, h3, t1, p, t3, if_block_anchor;

    	function select_block_type_3(changed, ctx) {
    		if (ctx.addingTag) return create_if_block_2$2;
    		return create_else_block_1$2;
    	}

    	var current_block_type = select_block_type_3(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			h3.textContent = "Add new collection";
    			t1 = space();
    			p = element("p");
    			p.textContent = "The collections you add here will be added to the images appearing\r\n            on the left.";
    			t3 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h3, "class", "collection-title svelte-13nl7d6");
    			add_location(h3, file$a, 219, 10, 5261);
    			add_location(p, file$a, 220, 10, 5325);
    			attr_dev(div, "class", "collection-header svelte-13nl7d6");
    			add_location(div, file$a, 218, 8, 5218);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(div, t1);
    			append_dev(div, p);
    			insert_dev(target, t3, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type_3(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				detach_dev(t3);
    			}

    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$5.name, type: "if", source: "(218:6) {#if tags}", ctx });
    	return block;
    }

    // (228:8) {:else}
    function create_else_block_1$2(ctx) {
    	var form, input0, t, input1, dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			input0 = element("input");
    			t = space();
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "newtag");
    			add_location(input0, file$a, 229, 12, 5628);
    			attr_dev(input1, "type", "submit");
    			attr_dev(input1, "class", "button svelte-13nl7d6");
    			input1.value = "Assign collection";
    			add_location(input1, file$a, 230, 12, 5695);
    			add_location(form, file$a, 228, 10, 5567);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.addCollection), false, true)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, input0);

    			set_input_value(input0, ctx.newTag);

    			append_dev(form, t);
    			append_dev(form, input1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.newTag && (input0.value !== ctx.newTag)) set_input_value(input0, ctx.newTag);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(form);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1$2.name, type: "else", source: "(228:8) {:else}", ctx });
    	return block;
    }

    // (226:8) {#if addingTag}
    function create_if_block_2$2(ctx) {
    	var i;

    	const block = {
    		c: function create() {
    			i = element("i");
    			attr_dev(i, "class", "fa fa-spinner fa-spin");
    			add_location(i, file$a, 226, 10, 5503);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, i, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(i);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$2.name, type: "if", source: "(226:8) {#if addingTag}", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var if_block_anchor;

    	function select_block_type(changed, ctx) {
    		if (ctx.loadingImages) return create_if_block$5;
    		return create_else_block$5;
    	}

    	var current_block_type = select_block_type(null, ctx);
    	var if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
    				if_block.p(changed, ctx);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);
    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    let IMAGE_URL$3 = "//dev.himalayanacademy.com/hamsa-images";

    function instance$8($$self, $$props, $$invalidate) {
    	

      let loadingImages = true;
      let addingTag = false;
      let collections;
      let tags;
      let newTag = "";
      let images = [];
      let email;
      let password;

      const savedCredentials = () => {
        if (
          sessionStorage.getItem("email") !== null &&
          sessionStorage.getItem("password") !== null
        ) {
          email = sessionStorage.getItem("email");
          password = sessionStorage.getItem("password");
          return true;
        } else {
          return false;
        }
      };

      const updateCollection = (ev, collection, i) => {
        if (ev.target.checked) {
          $$invalidate('newTag', newTag = collection);
        }
        console.log();
      };

      const addCollection = () => {
        if (newTag.length <= 2) {
          alert("Can't add collections that short.");
          return false;
        }

        $$invalidate('addingTag', addingTag = true);
        $$invalidate('newTag', newTag = `Collection ${newTag}`);

        let res = images.map(i => addImageTag(email, password, i.checksum, newTag));

        Promise.all(res)
          .then(res2 => {
            console.log(res2);
            console.log("images old", images);
            $$invalidate('images', images = res2.map(r => r.addImageTag));
            console.log("images new", images);

            let snip = images.map(i => `&images=${i.checksum}`).join("");

            history.replaceState(
              { images },
              `Editing Images: ${images}`,
              `${location.pathname}?view=CollectionEditor${snip}`
            );

            getSelectors().then(selectors => {
              $$invalidate('tags', tags = selectors.keywords);
              $$invalidate('collections', collections = selectors.collections);
              $$invalidate('addingTag', addingTag = false);
            });

            $$invalidate('newTag', newTag = "");
          })
          .catch(n => {
            console.error(n);
            error = n.map(e => e.message).join(`. `);
            $$invalidate('addingTag', addingTag = false);
          });
      };

      const thumbnailToURL = t => {
        let i = t.replace("/images/", "");
        return `${IMAGE_URL$3}/${i}`;
      };

      const unsub = currentView.subscribe(i => {
        console.dir("view changed", i);
        if (i.view == "CollectionEditor") {
          getSelectors().then(selectors => {
            $$invalidate('tags', tags = selectors.keywords);
            $$invalidate('collections', collections = selectors.collections);
            $$invalidate('images', images = i.data.images);
            console.log(images);
            getImagesForCollectionEditor(images).then(r => {
              console.log("result", r);
              $$invalidate('images', images = images.map((c, i) => {
                return r[`i${i}`];
              }));
              console.log("images", images);
              $$invalidate('loadingImages', loadingImages = false);
            });
          });
        }
      });

      savedCredentials();

      onDestroy(() => unsub());

    	const change_handler = ({ collection, i }, ev) => updateCollection(ev, collection);

    	function input0_input_handler() {
    		newTag = this.value;
    		$$invalidate('newTag', newTag);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('loadingImages' in $$props) $$invalidate('loadingImages', loadingImages = $$props.loadingImages);
    		if ('addingTag' in $$props) $$invalidate('addingTag', addingTag = $$props.addingTag);
    		if ('collections' in $$props) $$invalidate('collections', collections = $$props.collections);
    		if ('tags' in $$props) $$invalidate('tags', tags = $$props.tags);
    		if ('newTag' in $$props) $$invalidate('newTag', newTag = $$props.newTag);
    		if ('images' in $$props) $$invalidate('images', images = $$props.images);
    		if ('IMAGE_URL' in $$props) IMAGE_URL$3 = $$props.IMAGE_URL;
    		if ('email' in $$props) email = $$props.email;
    		if ('password' in $$props) password = $$props.password;
    	};

    	return {
    		loadingImages,
    		addingTag,
    		collections,
    		tags,
    		newTag,
    		images,
    		updateCollection,
    		addCollection,
    		thumbnailToURL,
    		change_handler,
    		input0_input_handler
    	};
    }

    class CollectionEditor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "CollectionEditor", options, id: create_fragment$a.name });
    	}
    }

    /* src\App.svelte generated by Svelte v3.12.1 */

    const file$b = "src\\App.svelte";

    function create_fragment$b(ctx) {
    	var div, t0, t1, t2, current, dispose;

    	var header = new Header({ $$inline: true });

    	var hero = new Hero({ $$inline: true });

    	var selectorcontrols = new SelectorControls({ $$inline: true });

    	var switch_value = ctx.views[ctx.$currentView.view];

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
    			add_location(div, file$b, 28, 0, 774);
    			dispose = listen_dev(window, "popstate", ctx.pop);
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
    			if (switch_value !== (switch_value = ctx.views[ctx.$currentView.view])) {
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
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$b.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $currentView;

    	validate_store(currentView, 'currentView');
    	component_subscribe($$self, currentView, $$value => { $currentView = $$value; $$invalidate('$currentView', $currentView); });

    	

      const views = {
        InfoPage: InfoPage,
        Collection: Collection,
        CollectionEditor: CollectionEditor,
        Image: Image,
        ImageEditor: ImageEditor
      };

      loadFromURL();

      const pop = d => {
        currentView.set(d.state);
      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('$currentView' in $$props) currentView.set($currentView);
    	};

    	return { views, pop, $currentView };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$b, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$b.name });
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

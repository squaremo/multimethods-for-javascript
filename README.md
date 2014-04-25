# Multimethods for JavaScript

Another experiment in providing multimethods for JavaScript. My other
such experiment is an implementation of [Prototypes with multiple
dispatch][pmd].

This one simplifies things by keeping method information in the
procedure, rather than keeping it in the prototypes; this means it is
not sensitive to changing prototypes, i.e., it assumes the prototype
chain is fixed at the time of method declaration. This is usually a
reasonable assumption, since in most JavaScript code the constructors
will have been fully defined (i.e., their prototypes set) before being
used, and don't change afterwards. It also assumes objects are created
using a constructor, and not with `Object.create`.

The result (to be shown) is that we can build a finite automaton for
method selection, given some additional assumptions about the ordering
of selectors. Furthermore, the runtime method selection relies only on
`instanceof` and `typeof` (i.e., not on the `constructor` or
`__proto__` properties, nor on the `Object.getPrototypeOf' method).

My motivation for this module is avoiding hand-written overloading of
functions in [amqp.node][]. In the amqp.node API I would like to have,
for instance,

```js
Channel#assertQueue(queue, callback)
Channel#assertQueue(options, callback)
Channel#assertQueue(queue, options, callback)
```

Rather than writing code like this:

```js
Channel.prototype.assertQueue = function(arg1, arg2, arg3) {
    var queue, options, callback;
    if (arguments.length == 2) {
      callback = arg2;
      if (typeof arg1 === 'string') {
        queue = arg1; options = {};
      }
      else if (typeof arg1 === 'object') {
        queue = ''; options = arg1;
      }
      else {
        throw new IllegalArgumentError(
          "First argument must be a string or object");
      }
    }
    else if (arguments.length == 3) {
      queue = arg1; options = arg2; callback = arg3;
    }
    else throw new IllegalArgumentError("Requires 2 or 3 arguments");

    // ...
}
```

I'd like to write something more like this:

```js
var assertQueue = make_procedure();

define_method(assertQueue, Channel, String, Function,
    function(ch, queue, callback) {
      return assertQueue(ch, queue, {}, callback);
    });

define_method(assertQueue, Channel, Object, Function,
    function(ch, options, callback) {
      return assertQueue('', options, callback);
    });

define_method(assertQueue, Channel, String, Object, Function,
    function(ch, name, options, callback) {
      // ... do an RPC with the name and options given
    });

Channel.prototype.assertQueue = assertQueue;
```

The idea being, of course, that the method selection algorithm takes
the place of that hand-written code above.

In the example the methods vary by missing out arguments, so they
delegate to the all-possible-arguments version; but in general there
will be scenarios in which entirely different things can happen
depending on the types of the arguments. In those latter cases, it's
handy to be able to define the variations in different places, say if
one is extending a procedure defined elsewhere to account for a new
type.

## Related work

[http://blog.vjeux.com/2010/javascript/javascript-full-dispatch-multimethod.html]
takes a very similar tack to my intial implementation, but is perhaps
a bit more general (since it allows methods to be defined using
predicates rather than just constructors). The method selection is
"first match wins", which is ultimately not what I'm after.

[http://krisjordan.com/multimethod-js] looks similar (mainly due to
the name), but mimics the generic dispatch feature in Clojure (also
called "multimethods", which is a misnomer, in my opinion).

The algorithm, which can be summarised as "calculate a dispatch value
based on the argument then select the method associated with that
value", doesn't lend itself to dispatching on the types of the
arguments. For this reason it's not of use to me. (The Clojure
implementation is a bit more capable, and is able to dispatch using a
subclass relationship; it's still "first match wins" though.)

[pmd]: https://github.com/squaremo/js-pmd
[amqp.node]: https://github.com/squaremo/amqp.node

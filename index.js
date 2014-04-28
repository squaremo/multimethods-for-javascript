function make_procedure(fail) {
  function dispatch() {
    var arity = arguments.length;
    return dispatch_method(arity, dispatch.methods[arity], arguments, fail);
  }
  dispatch.methods = [];
  return dispatch;
}

function define_method(procedure /* types ..., body */) {
  var arity = arguments.length - 2;
  var body = arguments[arity+1];
  var methods = procedure.methods[arity] || [];
  var types = Array.prototype.slice.call(arguments, 1, arity+1);
  methods.push({
    types: types,
    predicates: types.map(type_predicate),
    method: body
  });
  methods.sort(function(a, b) {
    return lexical_compare(a.types, b.types);
  });
  procedure.methods[arity] = methods;
}

function dispatch_method(arity, methods, args, fail) {
  next_candidate:
  for (var i = 0; i < methods.length; i++) {
    var candidate = methods[i];
    var predicates = candidate.predicates;
//    console.log('Trying %s', types.map(function(t) { return t.name; }));
    for (var j = 0; j < arity; j++) {
      var arg = args[j];
//      console.log('Testing %s < %s', arg, types[j]);
      if (!predicates[j](arg)) {
//        console.log('backtracking');
        continue next_candidate;
      }
    }
    var fun = candidate.method;
    switch (arity) {
    case 0: return fun();
    case 1: return fun(args[0]);
    case 2: return fun(args[0], args[1]);
    case 3: return fun(args[0], args[1], args[2]);
    default: return fun.apply(fun, args);
    }
  }
  return fail(args);
}

function type_predicate(T) {
  if (T === Object) {
    return function(a) {
      return true;
    };
  }
  else if (T === String) {
    return function(a) {
      return (typeof a === 'string') || a instanceof String;
    };
  }
  else if (T === Number) {
    return function(a) {
      return (typeof a === 'number') || a instanceof Number;
    };
  }
  else if (T === Boolean) {
    return function(a) {
      return (typeof a === 'boolean') || a instanceof Boolean;
    };
  }
  else {
    return function(a) { return a instanceof T; };
  }
}

function lexical_compare(As, Bs) {
  // To decide the most specific method for some arguments, we need a
  // total order on method signatures (which are vectors of types).

  // We have a partial order on constructors,
  // A <- B => (A === B or A.prototype instanceof B)

  // Lexical order of the method signatures by itself won't give us a
  // total order, since we don't start with a total order on the
  // types; however, we can have a 'tie break' rule on otherwise
  // incomparable elements, which is simply this: if elements are not
  // otherwise comparable, use the order in which they were defined,
  // which is assumed to be that in which they are presented to the
  // comparison function.
  for (var i=0; i < As.length; i++) {
    var A = As[i], B = Bs[i];
    if (A.prototype instanceof B) return -1;
    else if (B.prototype instanceof A) return 1;
    else if (A !== B) return -1;
  }
  return 0;
}

module.exports.make_procedure = make_procedure;
module.exports.define_method = define_method;

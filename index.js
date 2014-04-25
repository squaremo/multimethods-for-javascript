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
    var fun = candidate.method; return fun.apply(fun, args);
  }
  return fail(args);
}

function type_predicate(T) {
  if (T === String) {
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

module.exports.make_procedure = make_procedure;
module.exports.define_method = define_method;

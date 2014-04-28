var GP = require('./');
var make_procedure = GP.make_procedure;
var define_method = GP.define_method;

function fail() {
  throw new Error('Expected a method to be selected');
}

suite('Single method', function() {

test('Thunk', function(done) {
  var p = make_procedure(function() { done(new Error()); });
  define_method(p, function() {
    done();
  });
  p();
});

test('Single arg', function(done) {
  var p = make_procedure(fail);
  define_method(p, Object, function(_obj) {
    done();
  });
  p({});
});

test('Object matches a literal string', function(done) {
  var p = make_procedure(fail);
  define_method(p, Object, function(_) {
    done();
  });
  p('a string');
});

test('Not a subclass', function(done) {
  var p = make_procedure(function() { done(); });
  define_method(p, String, function(_obj) {
    done(new Error("Shouldn't be called"));
  });
  p({});
});

test('Select second method', function(done) {
  var p = make_procedure(fail);
  define_method(p, String, function(_obj) {
    done(new Error("Shouldn't be called"));
  });
  define_method(p, Function, function(_obj) {
    done();
  });
  p(function() {});
});

test('Backtrack', function(done) {
  var p = make_procedure(fail);
  define_method(p, String, Function, function() {
    done(new Error("Wrong method selected"));
  });
  define_method(p, String, Object, function() {
    done();
  });
  p('foo', {});
});

});

suite("Method selection", function() {

test('More specific declared last', function(done) {
  var p = make_procedure(fail);
  define_method(p, Object, function() {
    done(new Error('Expected more specific method to be selected'));
  });
  define_method(p, String, function() {
    done();
  });
  p('a string');
});

});

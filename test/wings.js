var assert, equal, t, template, vows;
assert = require('assert');
vows = require('vows');
template = require('../lib/template.js');
t = template.renderTemplate;
equal = assert.equal;
if (!(vows.add != null)) {
  vows.add = function(name, batch) {
    return vows.describe(name).addBatch(batch)["export"](module);
  };
}
vows.add('templates', {
  'basics:': {
    'an empty template': {
      topic: t(''),
      'should be equal to the empty string': function(topic) {
        return equal(topic, '');
      }
    },
    'a template with no tags': {
      topic: t('I think, therefore I am.'),
      'should be equal to the same string': function(topic) {
        return equal(topic, 'I think, therefore I am.');
      }
    },
    'templates with escaped braces': {
      topic: [
        t('I think, {{therefore I am.}}'), t('I }}{{think, {{{{therefore I am.}}}}'), t('nested {{ {:truthy} {{ braces }} {{ {/truthy} }}', {
          truthy: true
        })
      ],
      'should have double braces replaced with single braces': function(topics) {
        equal(topics[0], 'I think, {therefore I am.}');
        equal(topics[1], 'I }{think, {{therefore I am.}}');
        return equal(topics[2], 'nested { { braces } { }');
      }
    }
  },
  'tags:': {
    'a template with a single tag': {
      topic: t('{test}', {
        test: 'blah'
      }),
      'should be equal to the tag value': function(topic) {
        return equal(topic, 'blah');
      }
    },
    'a template with multiple tags': {
      topic: t('The {adj1}, {adj2} fox {verb1} over the {adj3} dogs.', {
        adj1: 'quick',
        adj2: 'brown',
        adj3: 'lazy',
        verb1: 'jumped'
      }),
      'should replace all the tags': function(topic) {
        return equal(topic, 'The quick, brown fox jumped over the lazy dogs.');
      }
    },
    'a template with dotted tags': {
      topic: t('The {adjs.adj1}, {adjs.adj2} fox {verbs.verb1} over the {adjs.adj3} dogs.', {
        adjs: {
          adj1: 'quick',
          adj2: 'brown',
          adj3: 'lazy'
        },
        verbs: {
          verb1: 'jumped'
        }
      }),
      'should replace the tags with the object properties': function(topic) {
        return equal(topic, 'The quick, brown fox jumped over the lazy dogs.');
      }
    },
    'a template with a function tag': {
      topic: t('The result of the function is: "{fn1}".', {
        fn1: function() {
          return 'test';
        }
      }),
      'should replace the tag with the result of the function': function(topic) {
        return equal(topic, 'The result of the function is: "test".');
      }
    },
    'a template with comment tags': {
      topic: t('There are comments{# comment #} in this template{# longer comment #}.'),
      'should remove the comments when rendered': function(topic) {
        return equal(topic, 'There are comments in this template.');
      }
    },
    'a template with escaped tags': {
      topic: t('This shouldn\'t produce html: {html}', {
        html: '<b>bolded</b>'
      }),
      'should escape the html reserved characters': function(topic) {
        return equal(topic, 'This shouldn\'t produce html: &ltb&gtbolded&lt/b&gt');
      }
    },
    'a template with unescaped tags': {
      topic: t('This should produce html: {&html}', {
        html: '<b>bolded</b>'
      }),
      'should produce html': function(topic) {
        return equal(topic, 'This should produce html: <b>bolded</b>');
      }
    }
  },
  'links:': {
    'a template with a normal link': {
      topic: t('{@foo}', {
        bar: 'baz'
      }, {
        foo: '{bar}'
      }),
      'should follow the link': function(topic) {
        return equal(topic, 'baz');
      }
    },
    'a template with a function link': {
      topic: t('{@foo}', {
        bar: 'baz'
      }, {
        foo: function() {
          return '{bar}';
        }
      }),
      'should call the function to get the link': function(topic) {
        return equal(topic, 'baz');
      }
    }
  },
  'sections:': {
    'templates with regular sections': {
      topic: [
        t('{:untruthy}foo{/untruthy}bar', {
          untruthy: 0
        }), t('{:untruthy}foo{/untruthy}bar', {
          untruthy: []
        }), t('{:untruthy}foo{/untruthy}bar', {
          untruthy: false
        }), t('{:truthy}foo{/truthy}bar', {
          truthy: 1
        }), t('{:truthy}foo{/truthy}bar', {
          truthy: {}
        }), t('{:truthy}foo{/truthy}bar', {
          truthy: true
        })
      ],
      'should only include those sections when the tag is truthy': function(topics) {
        equal(topics[0], 'bar');
        equal(topics[1], 'bar');
        equal(topics[2], 'bar');
        equal(topics[3], 'foobar');
        equal(topics[4], 'foobar');
        return equal(topics[5], 'foobar');
      }
    },
    'templates with inverse sections': {
      topic: [
        t('{!untruthy}foo{/untruthy}bar', {
          untruthy: 0
        }), t('{!untruthy}foo{/untruthy}bar', {
          untruthy: []
        }), t('{!untruthy}foo{/untruthy}bar', {
          untruthy: false
        }), t('{!truthy}foo{/truthy}bar', {
          truthy: 1
        }), t('{!truthy}foo{/truthy}bar', {
          truthy: {}
        }), t('{!truthy}foo{/truthy}bar', {
          truthy: true
        })
      ],
      'should only include those sections when the tag is not truthy': function(topics) {
        equal(topics[0], 'foobar');
        equal(topics[1], 'foobar');
        equal(topics[2], 'foobar');
        equal(topics[3], 'bar');
        equal(topics[4], 'bar');
        return equal(topics[5], 'bar');
      }
    },
    'templates with array sections': {
      topic: [
        t('{:array}foo{/array}bar', {
          array: [1, 2, 3]
        }), t('{:array}{}{/array}', {
          array: ['foo', 'bar', 'baz']
        }), t('{:array}{}a{/array}', {
          array: [1, 2, 3, 4, 5]
        }), t('{:array}{name}{/array}', {
          array: [
            {
              name: 'foo'
            }, {
              name: 'bar'
            }, {
              name: 'baz'
            }
          ]
        }), t('{:array1}foo{/array1}bar{:array2}{}{/array2}{:array3}{}a{/array3}{:array4}{name}{/array4}', {
          array1: [1, 2, 3],
          array2: ['foo', 'bar', 'baz'],
          array3: [1, 2, 3, 4, 5],
          array4: [
            {
              name: 'foo'
            }, {
              name: 'bar'
            }, {
              name: 'baz'
            }
          ]
        })
      ],
      'should render the section once for each item in the array': function(topics) {
        equal(topics[0], 'foofoofoobar');
        equal(topics[1], 'foobarbaz');
        equal(topics[2], '1a2a3a4a5a');
        equal(topics[3], 'foobarbaz');
        return equal(topics[4], 'foofoofoobarfoobarbaz1a2a3a4a5afoobarbaz');
      }
    },
    'a template with an object section': {
      topic: t('{:obj}{foo}{bar}{baz}{/obj}', {
        obj: {
          foo: '1',
          bar: '2',
          baz: '3'
        }
      }),
      'should use the object as the new environment': function(topic) {
        return equal(topic, '123');
      }
    },
    'a template with a function section': {
      topic: t('{:fn}abcdef{/fn}', {
        fn: function(str) {
          return str.split('').reverse().join('');
        }
      }),
      'should replace the section with the result of the function': function(topic) {
        return equal(topic, 'fedcba');
      }
    },
    'a template with subtemplates': {
      topic: t('{:tmpls}{name}: \'{text}\',{/tmpls}', {
        tmpls: [
          {
            name: 'tmpl1',
            text: 'The {adj1}, {adj2} fox {verb1} over the {adj3} dogs.'
          }, {
            name: 'tmpl2',
            text: '{:untrue}foo{/untrue}bar'
          }, {
            name: 'tmpl3',
            text: 'nested {{ {:truthy} {{ braces }} {{ {/truthy} }}'
          }
        ]
      }),
      'should insert the subtemplates unmodified': function(topic) {
        return equal(topic, 'tmpl1: \'The {adj1}, {adj2} fox {verb1} over the {adj3} dogs.\',\ntmpl2: \'{:untrue}foo{/untrue}bar\',\ntmpl3: \'nested {{ {:truthy} {{ braces }} {{ {/truthy} }}\','.replace(/\n/g, ''));
      }
    }
  }
});
{ Wings }
=========

_Wings_ is a logic-less templating library that works on the server and client.
It is based on [Mustache](http://mustache.github.com/), but the syntax is less
verbose and a few advanced features are sacrificed for small code size
(0.75kb compressed!).

Usage
-----

The module exposes a single function,
`wings.renderTemplate(template, data, links)`. When used with
[Ender](http://ender.no.de), this function is aliased as `$.render`, which can
also be called on selected elements. In the latter case, the function takes
two arguments, and the contents of the element will be rendered as the
template and returned.

Syntax
------

The syntax of Wings can be broken down into two broad categories:
tags and sections.

### Tags ###

Tags are how values are inserted into the template.

#### Basic Tags ####

A single value can be interpolated into the template by just surrounding it
with curly braces:

    The quick, brown {animal} jumped over the lazy dogs.

Here, the value of `animal` in the current context will inserted into the
sentence where the tag `{animal}` appears.

#### Raw Tags ####

In the above example, HTML-unsafe characters will be escaped, to prevent this
behavior, use a raw text tag:

    <a href="{&url}">{text}</a>

The value of `url` will not be escaped.

#### Link Tags ####

To render a subtemplate passed in as a link, use a link tag:

    <div>
        {@main}
    </div>

#### Comment Tags ####

Comments can be inserted into the template using comment tags:

    {# Basic Tag Example #}
    The quick, brown {animal} jumped over the lazy dogs.

### Tag Filters ###

Filters are primitive functions that can be called on tag values. They can be
chained but the only input is the tags value or the value of the previous filter.

    var data = {
        createdAt: 1453165050000
    };
    var links = null;
    var filters = {
        formatTime: function(ts) {
            return (new Date(ts)).toISOString();
        },
        add: function(ts) {
            return ts + 100000000;
        }
    };

    var template1 = "{createdAt | formatTime}";
    renderTemplate(template1, data, links, filters);
    //=> 2016-01-19T00:57:30.000Z

    var template2 = "{createdAt | add | formatTime}";
    renderTemplate(template2, data, links, filters);
    //=> 2016-01-20T04:44:10.000Z


### Sections ###

Sections are blocks of the template that are rendered together.

#### Basic Sections ####

A basic section is defined as follows:

    {:foo}This is a section.{/foo}

The output of the section depends on the value of foo. If `foo` is a boolean,
the section will either be included or omitted depending on `foo`'s truthiness.
If `foo` is an array, then the section will be rendered once for each element
of `foo`, with the value of the element as the new context. So, for example,
if `foo` was equal to the array `[{name: 'John'}, {name: 'Jane'}]`, then

    {:foo}
    Hi, my name is {name}.
    {/foo}

would be rendered as:

    Hi, my name is John.
    Hi, my name is Jane.

If the section is rendered with a object instead of an array, the section
will be rendered once with that object serving as the context. Finally,
if the section is a function, the function will be called with its first
argument given as the raw text of the section, and the return value will
replace the section.

#### Inverted Sections ####

Inverted sections are like normal sections, except that the section will
only be rendered if the value is false or the given array is empty:

    {!foo}
    The foo value was false.
    {/foo}

Acknowledgements
----------------

This module owes much of its design and inspiration to Mustache.

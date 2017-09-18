/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var GmqlHighlightRules = function() {

    var keywords = (
        "select|project|extend|group|merge|order" //relational unary operations
			+ "|sort" // ?do we have? //relational unary operations
			+ "|union|difference" //relational binary operations
			+ "|cover|flat|summit|histogram|map|join" //domain specific operations
			+ "|materialize" //utility operations
    );

    var builtinConstants = (
        "true|false|distance|mindist|mindistance|dle|dge|md|any|all|start|stop|chr|strand|left|right|up|down|downstream|upstream"
			+ "|and|or|not|as|in|allbut"
			+ "|count|bag|sum|avg|min|max|median|std"
			+ "|cat|contig" 
            + "|dist|dg|dg|bagd"
            + "|left_distinct|right_distinct|both"
    );

    var builtinFunctions = (
        "region|semijoin" // SELECT
			+ "|metadata|region_update|metadata_update" // PROJECT
			+ "|meta_aggregate|region_group|region_aggregate" //GROUP
			+ "|groupby" // MERGE
			+ "|desc|meta_top|meta_topg|region_order|region_top|region_topg|" // ORDER
			+ "|groupby" // MERGE
			+ "|joinby" //DIFFERENCE
			+ "|aggregate" //COVER(flat/summit/histogram
			+ "|output" //JOIN
			+ "|into" //MATERIALIZE
			//+ "|parser|region_modifier|meta_modifier|meta_project"
    );

    var dataTypes = (
        "int|numeric|decimal|date|varchar|char|bigint|float|double|bit|binary|text|set|timestamp|" +
        "money|real|number|integer"
    );

    var keywordMapper = this.createKeywordMapper({
        "support.function": builtinFunctions,
        "keyword": keywords,
        "constant.language": builtinConstants,
        "storage.type": dataTypes
    }, "identifier", true);

    var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
        "u[0-9a-fA-F]{4}|" + // unicode
        "[0-2][0-7]{0,2}|" + // oct
        "3[0-6][0-7]?|" + // oct
        "37[0-7]?|" + // oct
        "[4-7][0-7]?|" + //oct
        ".)";

    this.$rules = {
        "start" : [ {
            token : "comment",
            regex : "#.*$"
        }, {
            token : "string",
            regex : "'(?=.)",
            next  : "qstring"
        }, {
            token : "string",
            regex : '"(?=.)',
            next  : "qqstring"
        }, {
            token : "constant.numeric", // float
            regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b"
        }, {
            token : keywordMapper,
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        }, {
            token : "keyword.operator",
            regex : "\\+|\\-|\\/|\\/\\/|%|<@>|@>|<@|&|\\^|~|<|>|<=|=>|==|!=|<>|=|,|;|:" 
        }, {
            token : "paren.lparen",
            regex : "[\\(]"
        }, {
            token : "paren.rparen",
            regex : "[\\)]"
        }, {
            token : "text",
            regex : "\\s+"
        } ],
        "qqstring" : [ {
            token : "constant.language.escape",
            regex : escapedRe
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qqstring"
        }, {
            token : "string",
            regex : '"|$',
            next  : "no_regex"
        }, {
            defaultToken: "string"
        }],
        "qstring" : [ {
            token : "constant.language.escape",
            regex : escapedRe
        }, {
            token : "string",
            regex : "\\\\$",
            next  : "qstring"
        }, {
            token : "string",
            regex : "'|$",
            next  : "no_regex"
        }, {
            defaultToken: "string"
        }]
    };
    this.normalizeRules();
};

oop.inherits(GmqlHighlightRules, TextHighlightRules);

exports.GmqlHighlightRules = GmqlHighlightRules;
});


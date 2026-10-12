"use strict";
export const validateSourceSnapshot = validate20;
const schema12 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"[\\s\\S]"},"source":{"type":"string","pattern":"[\\s\\S]"},"url":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},"sourceUpdatedAt":{"anyOf":[{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},{"type":"null"}]},"retrievedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"bytes":{"type":"integer","minimum":0},"records":{"type":"integer","minimum":0},"parserVersion":{"type":"string","pattern":"[\\s\\S]"},"status":{"enum":["complete"]}},"required":["id","source","url","sourceUpdatedAt","retrievedAt","sha256","bytes","records","parserVersion","status"]};
const func2 = Object.prototype.hasOwnProperty;
const pattern0 = new RegExp("[\\s\\S]", "u");
const pattern2 = new RegExp("^[hH][tT][tT][pP][sS]?://[^\\s]+$", "u");
const pattern3 = new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$", "u");
const pattern5 = new RegExp("^[0-9a-f]{64}$", "u");

function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.source === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "source"},message:"must have required property '"+"source"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.url === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "url"},message:"must have required property '"+"url"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sourceUpdatedAt === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceUpdatedAt"},message:"must have required property '"+"sourceUpdatedAt"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.retrievedAt === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.sha256 === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.bytes === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bytes"},message:"must have required property '"+"bytes"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.records === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "records"},message:"must have required property '"+"records"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.parserVersion === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "parserVersion"},message:"must have required property '"+"parserVersion"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.status === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema12.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err11 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.source !== undefined){
let data1 = data.source;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err13 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.url !== undefined){
let data2 = data.url;
if(typeof data2 === "string"){
if(!pattern2.test(data2)){
const err15 = {instancePath:instancePath+"/url",schemaPath:"#/properties/url/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/url",schemaPath:"#/properties/url/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.sourceUpdatedAt !== undefined){
let data3 = data.sourceUpdatedAt;
const _errs9 = errors;
let valid1 = false;
const _errs10 = errors;
if(typeof data3 === "string"){
if(!pattern3.test(data3)){
const err17 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs12 = errors;
if(data3 !== null){
const err19 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid0 = _errs12 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err20 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
if(data.retrievedAt !== undefined){
let data4 = data.retrievedAt;
if(typeof data4 === "string"){
if(!pattern3.test(data4)){
const err21 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.sha256 !== undefined){
let data5 = data.sha256;
if(typeof data5 === "string"){
if(!pattern5.test(data5)){
const err23 = {instancePath:instancePath+"/sha256",schemaPath:"#/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/sha256",schemaPath:"#/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.bytes !== undefined){
let data6 = data.bytes;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err25 = {instancePath:instancePath+"/bytes",schemaPath:"#/properties/bytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 < 0 || isNaN(data6)){
const err26 = {instancePath:instancePath+"/bytes",schemaPath:"#/properties/bytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
if(data.records !== undefined){
let data7 = data.records;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
const err27 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 < 0 || isNaN(data7)){
const err28 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
if(data.parserVersion !== undefined){
let data8 = data.parserVersion;
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err29 = {instancePath:instancePath+"/parserVersion",schemaPath:"#/properties/parserVersion/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/parserVersion",schemaPath:"#/properties/parserVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.status !== undefined){
if(!(data.status === "complete")){
const err31 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema12.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}

export const validatePrintingFace = validate21;
const schema13 = {"type":"object","additionalProperties":false,"properties":{"index":{"type":"integer","minimum":0},"name":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"oracleId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"sourceArtistCredit":{"anyOf":[{"type":"string"},{"type":"null"}]},"artistIds":{"type":"array","items":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}},"illustrationId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"imageUrl":{"anyOf":[{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},{"type":"null"}]}},"required":["index","name","oracleId","sourceArtistCredit","artistIds","illustrationId","imageUrl"]};
const pattern8 = new RegExp("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", "u");

function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.index === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "index"},message:"must have required property '"+"index"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.name === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.oracleId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "oracleId"},message:"must have required property '"+"oracleId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sourceArtistCredit === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceArtistCredit"},message:"must have required property '"+"sourceArtistCredit"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.artistIds === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artistIds"},message:"must have required property '"+"artistIds"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.illustrationId === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "illustrationId"},message:"must have required property '"+"illustrationId"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.imageUrl === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "imageUrl"},message:"must have required property '"+"imageUrl"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key0 in data){
if(!(((((((key0 === "index") || (key0 === "name")) || (key0 === "oracleId")) || (key0 === "sourceArtistCredit")) || (key0 === "artistIds")) || (key0 === "illustrationId")) || (key0 === "imageUrl"))){
const err7 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.index !== undefined){
let data0 = data.index;
if(!(((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0))) && (isFinite(data0)))){
const err8 = {instancePath:instancePath+"/index",schemaPath:"#/properties/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data0 == "number") && (isFinite(data0))){
if(data0 < 0 || isNaN(data0)){
const err9 = {instancePath:instancePath+"/index",schemaPath:"#/properties/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
if(data.name !== undefined){
let data1 = data.name;
const _errs5 = errors;
let valid1 = false;
const _errs6 = errors;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err10 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var _valid0 = _errs6 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs8 = errors;
if(data1 !== null){
const err12 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err13 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
else {
errors = _errs5;
if(vErrors !== null){
if(_errs5){
vErrors.length = _errs5;
}
else {
vErrors = null;
}
}
}
}
if(data.oracleId !== undefined){
let data2 = data.oracleId;
const _errs11 = errors;
let valid2 = false;
const _errs12 = errors;
if(typeof data2 === "string"){
if(!pattern8.test(data2)){
const err14 = {instancePath:instancePath+"/oracleId",schemaPath:"#/properties/oracleId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/oracleId",schemaPath:"#/properties/oracleId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var _valid1 = _errs12 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs14 = errors;
if(data2 !== null){
const err16 = {instancePath:instancePath+"/oracleId",schemaPath:"#/properties/oracleId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var _valid1 = _errs14 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err17 = {instancePath:instancePath+"/oracleId",schemaPath:"#/properties/oracleId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
else {
errors = _errs11;
if(vErrors !== null){
if(_errs11){
vErrors.length = _errs11;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceArtistCredit !== undefined){
let data3 = data.sourceArtistCredit;
const _errs17 = errors;
let valid3 = false;
const _errs18 = errors;
if(typeof data3 !== "string"){
const err18 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
var _valid2 = _errs18 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs20 = errors;
if(data3 !== null){
const err19 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid2 = _errs20 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err20 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
else {
errors = _errs17;
if(vErrors !== null){
if(_errs17){
vErrors.length = _errs17;
}
else {
vErrors = null;
}
}
}
}
if(data.artistIds !== undefined){
let data4 = data.artistIds;
if(Array.isArray(data4)){
const len0 = data4.length;
for(let i0=0; i0<len0; i0++){
let data5 = data4[i0];
if(typeof data5 === "string"){
if(!pattern8.test(data5)){
const err21 = {instancePath:instancePath+"/artistIds/" + i0,schemaPath:"#/properties/artistIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/artistIds/" + i0,schemaPath:"#/properties/artistIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
else {
const err23 = {instancePath:instancePath+"/artistIds",schemaPath:"#/properties/artistIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.illustrationId !== undefined){
let data6 = data.illustrationId;
const _errs27 = errors;
let valid6 = false;
const _errs28 = errors;
if(typeof data6 === "string"){
if(!pattern8.test(data6)){
const err24 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
var _valid3 = _errs28 === errors;
valid6 = valid6 || _valid3;
if(!valid6){
const _errs30 = errors;
if(data6 !== null){
const err26 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
var _valid3 = _errs30 === errors;
valid6 = valid6 || _valid3;
}
if(!valid6){
const err27 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
else {
errors = _errs27;
if(vErrors !== null){
if(_errs27){
vErrors.length = _errs27;
}
else {
vErrors = null;
}
}
}
}
if(data.imageUrl !== undefined){
let data7 = data.imageUrl;
const _errs33 = errors;
let valid7 = false;
const _errs34 = errors;
if(typeof data7 === "string"){
if(!pattern2.test(data7)){
const err28 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid4 = _errs34 === errors;
valid7 = valid7 || _valid4;
if(!valid7){
const _errs36 = errors;
if(data7 !== null){
const err30 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
var _valid4 = _errs36 === errors;
valid7 = valid7 || _valid4;
}
if(!valid7){
const err31 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
else {
errors = _errs33;
if(vErrors !== null){
if(_errs33){
vErrors.length = _errs33;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err32 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
validate21.errors = vErrors;
return errors === 0;
}

export const validateCardPrinting = validate22;
const schema14 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},"oracleIds":{"type":"array","items":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}},"name":{"type":"string","pattern":"[\\s\\S]"},"printedName":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"setCode":{"type":"string","pattern":"[\\s\\S]"},"setName":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"collectorNumber":{"type":"string","pattern":"[\\s\\S]"},"language":{"type":"string","pattern":"[\\s\\S]"},"finishes":{"type":"array","items":{"enum":["nonfoil","foil","etched"]}},"layout":{"type":"string","pattern":"[\\s\\S]"},"games":{"type":"array","items":{"enum":["paper","mtgo","arena","astral","sega"]}},"paper":{"type":"boolean"},"digital":{"type":"boolean"},"category":{"enum":["card","token","emblem","art_card","auxiliary"]},"sourceArtistCredit":{"anyOf":[{"type":"string"},{"type":"null"}]},"artistIds":{"type":"array","items":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}},"illustrationId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"imageUrl":{"anyOf":[{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},{"type":"null"}]},"scryfallUrl":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},"faces":{"type":"array","items":{"$ref":"#/$defs/PrintingFace"}}},"required":["id","oracleIds","name","printedName","setCode","setName","collectorNumber","language","finishes","layout","games","paper","digital","category","sourceArtistCredit","artistIds","illustrationId","imageUrl","scryfallUrl","faces"]};

function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.oracleIds === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "oracleIds"},message:"must have required property '"+"oracleIds"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.name === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.printedName === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "printedName"},message:"must have required property '"+"printedName"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.setCode === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "setCode"},message:"must have required property '"+"setCode"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.setName === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "setName"},message:"must have required property '"+"setName"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.collectorNumber === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "collectorNumber"},message:"must have required property '"+"collectorNumber"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.language === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "language"},message:"must have required property '"+"language"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.finishes === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "finishes"},message:"must have required property '"+"finishes"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.layout === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "layout"},message:"must have required property '"+"layout"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.games === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "games"},message:"must have required property '"+"games"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.paper === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "paper"},message:"must have required property '"+"paper"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data.digital === undefined){
const err12 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "digital"},message:"must have required property '"+"digital"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data.category === undefined){
const err13 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "category"},message:"must have required property '"+"category"+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data.sourceArtistCredit === undefined){
const err14 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceArtistCredit"},message:"must have required property '"+"sourceArtistCredit"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data.artistIds === undefined){
const err15 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artistIds"},message:"must have required property '"+"artistIds"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(data.illustrationId === undefined){
const err16 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "illustrationId"},message:"must have required property '"+"illustrationId"+"'"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(data.imageUrl === undefined){
const err17 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "imageUrl"},message:"must have required property '"+"imageUrl"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data.scryfallUrl === undefined){
const err18 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scryfallUrl"},message:"must have required property '"+"scryfallUrl"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(data.faces === undefined){
const err19 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "faces"},message:"must have required property '"+"faces"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema14.properties, key0))){
const err20 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern8.test(data0)){
const err21 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.oracleIds !== undefined){
let data1 = data.oracleIds;
if(Array.isArray(data1)){
const len0 = data1.length;
for(let i0=0; i0<len0; i0++){
let data2 = data1[i0];
if(typeof data2 === "string"){
if(!pattern8.test(data2)){
const err23 = {instancePath:instancePath+"/oracleIds/" + i0,schemaPath:"#/properties/oracleIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/oracleIds/" + i0,schemaPath:"#/properties/oracleIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath:instancePath+"/oracleIds",schemaPath:"#/properties/oracleIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.name !== undefined){
let data3 = data.name;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err26 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.printedName !== undefined){
let data4 = data.printedName;
const _errs11 = errors;
let valid3 = false;
const _errs12 = errors;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err28 = {instancePath:instancePath+"/printedName",schemaPath:"#/properties/printedName/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/printedName",schemaPath:"#/properties/printedName/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid0 = _errs12 === errors;
valid3 = valid3 || _valid0;
if(!valid3){
const _errs14 = errors;
if(data4 !== null){
const err30 = {instancePath:instancePath+"/printedName",schemaPath:"#/properties/printedName/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
var _valid0 = _errs14 === errors;
valid3 = valid3 || _valid0;
}
if(!valid3){
const err31 = {instancePath:instancePath+"/printedName",schemaPath:"#/properties/printedName/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
else {
errors = _errs11;
if(vErrors !== null){
if(_errs11){
vErrors.length = _errs11;
}
else {
vErrors = null;
}
}
}
}
if(data.setCode !== undefined){
let data5 = data.setCode;
if(typeof data5 === "string"){
if(!pattern0.test(data5)){
const err32 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
else {
const err33 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data.setName !== undefined){
let data6 = data.setName;
const _errs19 = errors;
let valid4 = false;
const _errs20 = errors;
if(typeof data6 === "string"){
if(!pattern0.test(data6)){
const err34 = {instancePath:instancePath+"/setName",schemaPath:"#/properties/setName/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/setName",schemaPath:"#/properties/setName/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid1 = _errs20 === errors;
valid4 = valid4 || _valid1;
if(!valid4){
const _errs22 = errors;
if(data6 !== null){
const err36 = {instancePath:instancePath+"/setName",schemaPath:"#/properties/setName/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
var _valid1 = _errs22 === errors;
valid4 = valid4 || _valid1;
}
if(!valid4){
const err37 = {instancePath:instancePath+"/setName",schemaPath:"#/properties/setName/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
else {
errors = _errs19;
if(vErrors !== null){
if(_errs19){
vErrors.length = _errs19;
}
else {
vErrors = null;
}
}
}
}
if(data.collectorNumber !== undefined){
let data7 = data.collectorNumber;
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err38 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
else {
const err39 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.language !== undefined){
let data8 = data.language;
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err40 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
else {
const err41 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.finishes !== undefined){
let data9 = data.finishes;
if(Array.isArray(data9)){
const len1 = data9.length;
for(let i1=0; i1<len1; i1++){
let data10 = data9[i1];
if(!(((data10 === "nonfoil") || (data10 === "foil")) || (data10 === "etched"))){
const err42 = {instancePath:instancePath+"/finishes/" + i1,schemaPath:"#/properties/finishes/items/enum",keyword:"enum",params:{allowedValues: schema14.properties.finishes.items.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
}
else {
const err43 = {instancePath:instancePath+"/finishes",schemaPath:"#/properties/finishes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
if(data.layout !== undefined){
let data11 = data.layout;
if(typeof data11 === "string"){
if(!pattern0.test(data11)){
const err44 = {instancePath:instancePath+"/layout",schemaPath:"#/properties/layout/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
else {
const err45 = {instancePath:instancePath+"/layout",schemaPath:"#/properties/layout/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
if(data.games !== undefined){
let data12 = data.games;
if(Array.isArray(data12)){
const len2 = data12.length;
for(let i2=0; i2<len2; i2++){
let data13 = data12[i2];
if(!(((((data13 === "paper") || (data13 === "mtgo")) || (data13 === "arena")) || (data13 === "astral")) || (data13 === "sega"))){
const err46 = {instancePath:instancePath+"/games/" + i2,schemaPath:"#/properties/games/items/enum",keyword:"enum",params:{allowedValues: schema14.properties.games.items.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
else {
const err47 = {instancePath:instancePath+"/games",schemaPath:"#/properties/games/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
if(data.paper !== undefined){
if(typeof data.paper !== "boolean"){
const err48 = {instancePath:instancePath+"/paper",schemaPath:"#/properties/paper/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data.digital !== undefined){
if(typeof data.digital !== "boolean"){
const err49 = {instancePath:instancePath+"/digital",schemaPath:"#/properties/digital/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
if(data.category !== undefined){
let data16 = data.category;
if(!(((((data16 === "card") || (data16 === "token")) || (data16 === "emblem")) || (data16 === "art_card")) || (data16 === "auxiliary"))){
const err50 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/enum",keyword:"enum",params:{allowedValues: schema14.properties.category.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
if(data.sourceArtistCredit !== undefined){
let data17 = data.sourceArtistCredit;
const _errs42 = errors;
let valid9 = false;
const _errs43 = errors;
if(typeof data17 !== "string"){
const err51 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
var _valid2 = _errs43 === errors;
valid9 = valid9 || _valid2;
if(!valid9){
const _errs45 = errors;
if(data17 !== null){
const err52 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
var _valid2 = _errs45 === errors;
valid9 = valid9 || _valid2;
}
if(!valid9){
const err53 = {instancePath:instancePath+"/sourceArtistCredit",schemaPath:"#/properties/sourceArtistCredit/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
else {
errors = _errs42;
if(vErrors !== null){
if(_errs42){
vErrors.length = _errs42;
}
else {
vErrors = null;
}
}
}
}
if(data.artistIds !== undefined){
let data18 = data.artistIds;
if(Array.isArray(data18)){
const len3 = data18.length;
for(let i3=0; i3<len3; i3++){
let data19 = data18[i3];
if(typeof data19 === "string"){
if(!pattern8.test(data19)){
const err54 = {instancePath:instancePath+"/artistIds/" + i3,schemaPath:"#/properties/artistIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/artistIds/" + i3,schemaPath:"#/properties/artistIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
}
else {
const err56 = {instancePath:instancePath+"/artistIds",schemaPath:"#/properties/artistIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data.illustrationId !== undefined){
let data20 = data.illustrationId;
const _errs52 = errors;
let valid12 = false;
const _errs53 = errors;
if(typeof data20 === "string"){
if(!pattern8.test(data20)){
const err57 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
else {
const err58 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
var _valid3 = _errs53 === errors;
valid12 = valid12 || _valid3;
if(!valid12){
const _errs55 = errors;
if(data20 !== null){
const err59 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
var _valid3 = _errs55 === errors;
valid12 = valid12 || _valid3;
}
if(!valid12){
const err60 = {instancePath:instancePath+"/illustrationId",schemaPath:"#/properties/illustrationId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
else {
errors = _errs52;
if(vErrors !== null){
if(_errs52){
vErrors.length = _errs52;
}
else {
vErrors = null;
}
}
}
}
if(data.imageUrl !== undefined){
let data21 = data.imageUrl;
const _errs58 = errors;
let valid13 = false;
const _errs59 = errors;
if(typeof data21 === "string"){
if(!pattern2.test(data21)){
const err61 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
else {
const err62 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
var _valid4 = _errs59 === errors;
valid13 = valid13 || _valid4;
if(!valid13){
const _errs61 = errors;
if(data21 !== null){
const err63 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
var _valid4 = _errs61 === errors;
valid13 = valid13 || _valid4;
}
if(!valid13){
const err64 = {instancePath:instancePath+"/imageUrl",schemaPath:"#/properties/imageUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
else {
errors = _errs58;
if(vErrors !== null){
if(_errs58){
vErrors.length = _errs58;
}
else {
vErrors = null;
}
}
}
}
if(data.scryfallUrl !== undefined){
let data22 = data.scryfallUrl;
if(typeof data22 === "string"){
if(!pattern2.test(data22)){
const err65 = {instancePath:instancePath+"/scryfallUrl",schemaPath:"#/properties/scryfallUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
else {
const err66 = {instancePath:instancePath+"/scryfallUrl",schemaPath:"#/properties/scryfallUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
if(data.faces !== undefined){
let data23 = data.faces;
if(Array.isArray(data23)){
const len4 = data23.length;
for(let i4=0; i4<len4; i4++){
let data24 = data23[i4];
if(data24 && typeof data24 == "object" && !Array.isArray(data24)){
if(data24.index === undefined){
const err67 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "index"},message:"must have required property '"+"index"+"'"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data24.name === undefined){
const err68 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
if(data24.oracleId === undefined){
const err69 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "oracleId"},message:"must have required property '"+"oracleId"+"'"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
if(data24.sourceArtistCredit === undefined){
const err70 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "sourceArtistCredit"},message:"must have required property '"+"sourceArtistCredit"+"'"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
if(data24.artistIds === undefined){
const err71 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "artistIds"},message:"must have required property '"+"artistIds"+"'"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
if(data24.illustrationId === undefined){
const err72 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "illustrationId"},message:"must have required property '"+"illustrationId"+"'"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
if(data24.imageUrl === undefined){
const err73 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/required",keyword:"required",params:{missingProperty: "imageUrl"},message:"must have required property '"+"imageUrl"+"'"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
for(const key1 in data24){
if(!(((((((key1 === "index") || (key1 === "name")) || (key1 === "oracleId")) || (key1 === "sourceArtistCredit")) || (key1 === "artistIds")) || (key1 === "illustrationId")) || (key1 === "imageUrl"))){
const err74 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
if(data24.index !== undefined){
let data25 = data24.index;
if(!(((typeof data25 == "number") && (!(data25 % 1) && !isNaN(data25))) && (isFinite(data25)))){
const err75 = {instancePath:instancePath+"/faces/" + i4+"/index",schemaPath:"#/$defs/PrintingFace/properties/index/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
if((typeof data25 == "number") && (isFinite(data25))){
if(data25 < 0 || isNaN(data25)){
const err76 = {instancePath:instancePath+"/faces/" + i4+"/index",schemaPath:"#/$defs/PrintingFace/properties/index/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
if(data24.name !== undefined){
let data26 = data24.name;
const _errs74 = errors;
let valid18 = false;
const _errs75 = errors;
if(typeof data26 === "string"){
if(!pattern0.test(data26)){
const err77 = {instancePath:instancePath+"/faces/" + i4+"/name",schemaPath:"#/$defs/PrintingFace/properties/name/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
}
else {
const err78 = {instancePath:instancePath+"/faces/" + i4+"/name",schemaPath:"#/$defs/PrintingFace/properties/name/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
var _valid5 = _errs75 === errors;
valid18 = valid18 || _valid5;
if(!valid18){
const _errs77 = errors;
if(data26 !== null){
const err79 = {instancePath:instancePath+"/faces/" + i4+"/name",schemaPath:"#/$defs/PrintingFace/properties/name/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
var _valid5 = _errs77 === errors;
valid18 = valid18 || _valid5;
}
if(!valid18){
const err80 = {instancePath:instancePath+"/faces/" + i4+"/name",schemaPath:"#/$defs/PrintingFace/properties/name/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
else {
errors = _errs74;
if(vErrors !== null){
if(_errs74){
vErrors.length = _errs74;
}
else {
vErrors = null;
}
}
}
}
if(data24.oracleId !== undefined){
let data27 = data24.oracleId;
const _errs80 = errors;
let valid19 = false;
const _errs81 = errors;
if(typeof data27 === "string"){
if(!pattern8.test(data27)){
const err81 = {instancePath:instancePath+"/faces/" + i4+"/oracleId",schemaPath:"#/$defs/PrintingFace/properties/oracleId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
}
else {
const err82 = {instancePath:instancePath+"/faces/" + i4+"/oracleId",schemaPath:"#/$defs/PrintingFace/properties/oracleId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
var _valid6 = _errs81 === errors;
valid19 = valid19 || _valid6;
if(!valid19){
const _errs83 = errors;
if(data27 !== null){
const err83 = {instancePath:instancePath+"/faces/" + i4+"/oracleId",schemaPath:"#/$defs/PrintingFace/properties/oracleId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
var _valid6 = _errs83 === errors;
valid19 = valid19 || _valid6;
}
if(!valid19){
const err84 = {instancePath:instancePath+"/faces/" + i4+"/oracleId",schemaPath:"#/$defs/PrintingFace/properties/oracleId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
else {
errors = _errs80;
if(vErrors !== null){
if(_errs80){
vErrors.length = _errs80;
}
else {
vErrors = null;
}
}
}
}
if(data24.sourceArtistCredit !== undefined){
let data28 = data24.sourceArtistCredit;
const _errs86 = errors;
let valid20 = false;
const _errs87 = errors;
if(typeof data28 !== "string"){
const err85 = {instancePath:instancePath+"/faces/" + i4+"/sourceArtistCredit",schemaPath:"#/$defs/PrintingFace/properties/sourceArtistCredit/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
var _valid7 = _errs87 === errors;
valid20 = valid20 || _valid7;
if(!valid20){
const _errs89 = errors;
if(data28 !== null){
const err86 = {instancePath:instancePath+"/faces/" + i4+"/sourceArtistCredit",schemaPath:"#/$defs/PrintingFace/properties/sourceArtistCredit/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
var _valid7 = _errs89 === errors;
valid20 = valid20 || _valid7;
}
if(!valid20){
const err87 = {instancePath:instancePath+"/faces/" + i4+"/sourceArtistCredit",schemaPath:"#/$defs/PrintingFace/properties/sourceArtistCredit/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
else {
errors = _errs86;
if(vErrors !== null){
if(_errs86){
vErrors.length = _errs86;
}
else {
vErrors = null;
}
}
}
}
if(data24.artistIds !== undefined){
let data29 = data24.artistIds;
if(Array.isArray(data29)){
const len5 = data29.length;
for(let i5=0; i5<len5; i5++){
let data30 = data29[i5];
if(typeof data30 === "string"){
if(!pattern8.test(data30)){
const err88 = {instancePath:instancePath+"/faces/" + i4+"/artistIds/" + i5,schemaPath:"#/$defs/PrintingFace/properties/artistIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
}
else {
const err89 = {instancePath:instancePath+"/faces/" + i4+"/artistIds/" + i5,schemaPath:"#/$defs/PrintingFace/properties/artistIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
}
else {
const err90 = {instancePath:instancePath+"/faces/" + i4+"/artistIds",schemaPath:"#/$defs/PrintingFace/properties/artistIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
}
if(data24.illustrationId !== undefined){
let data31 = data24.illustrationId;
const _errs96 = errors;
let valid23 = false;
const _errs97 = errors;
if(typeof data31 === "string"){
if(!pattern8.test(data31)){
const err91 = {instancePath:instancePath+"/faces/" + i4+"/illustrationId",schemaPath:"#/$defs/PrintingFace/properties/illustrationId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
}
else {
const err92 = {instancePath:instancePath+"/faces/" + i4+"/illustrationId",schemaPath:"#/$defs/PrintingFace/properties/illustrationId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
var _valid8 = _errs97 === errors;
valid23 = valid23 || _valid8;
if(!valid23){
const _errs99 = errors;
if(data31 !== null){
const err93 = {instancePath:instancePath+"/faces/" + i4+"/illustrationId",schemaPath:"#/$defs/PrintingFace/properties/illustrationId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
var _valid8 = _errs99 === errors;
valid23 = valid23 || _valid8;
}
if(!valid23){
const err94 = {instancePath:instancePath+"/faces/" + i4+"/illustrationId",schemaPath:"#/$defs/PrintingFace/properties/illustrationId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
else {
errors = _errs96;
if(vErrors !== null){
if(_errs96){
vErrors.length = _errs96;
}
else {
vErrors = null;
}
}
}
}
if(data24.imageUrl !== undefined){
let data32 = data24.imageUrl;
const _errs102 = errors;
let valid24 = false;
const _errs103 = errors;
if(typeof data32 === "string"){
if(!pattern2.test(data32)){
const err95 = {instancePath:instancePath+"/faces/" + i4+"/imageUrl",schemaPath:"#/$defs/PrintingFace/properties/imageUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
}
else {
const err96 = {instancePath:instancePath+"/faces/" + i4+"/imageUrl",schemaPath:"#/$defs/PrintingFace/properties/imageUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
var _valid9 = _errs103 === errors;
valid24 = valid24 || _valid9;
if(!valid24){
const _errs105 = errors;
if(data32 !== null){
const err97 = {instancePath:instancePath+"/faces/" + i4+"/imageUrl",schemaPath:"#/$defs/PrintingFace/properties/imageUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
var _valid9 = _errs105 === errors;
valid24 = valid24 || _valid9;
}
if(!valid24){
const err98 = {instancePath:instancePath+"/faces/" + i4+"/imageUrl",schemaPath:"#/$defs/PrintingFace/properties/imageUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
else {
errors = _errs102;
if(vErrors !== null){
if(_errs102){
vErrors.length = _errs102;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err99 = {instancePath:instancePath+"/faces/" + i4,schemaPath:"#/$defs/PrintingFace/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
}
}
else {
const err100 = {instancePath:instancePath+"/faces",schemaPath:"#/properties/faces/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
}
}
else {
const err101 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
validate22.errors = vErrors;
return errors === 0;
}

export const validateArtist = validate23;
const schema16 = {"type":"object","additionalProperties":false,"properties":{"key":{"type":"string","pattern":"[\\s\\S]"},"displayName":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"sourceIds":{"type":"array","items":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}},"sourceNames":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"kind":{"enum":["individual","collective","unknown"]}},"required":["key","displayName","sourceIds","sourceNames","kind"]};

function validate23(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.key === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.displayName === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "displayName"},message:"must have required property '"+"displayName"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.sourceIds === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceIds"},message:"must have required property '"+"sourceIds"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sourceNames === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceNames"},message:"must have required property '"+"sourceNames"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.kind === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "key") || (key0 === "displayName")) || (key0 === "sourceIds")) || (key0 === "sourceNames")) || (key0 === "kind"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.key !== undefined){
let data0 = data.key;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err6 = {instancePath:instancePath+"/key",schemaPath:"#/properties/key/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/key",schemaPath:"#/properties/key/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.displayName !== undefined){
let data1 = data.displayName;
const _errs5 = errors;
let valid1 = false;
const _errs6 = errors;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err8 = {instancePath:instancePath+"/displayName",schemaPath:"#/properties/displayName/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/displayName",schemaPath:"#/properties/displayName/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
var _valid0 = _errs6 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs8 = errors;
if(data1 !== null){
const err10 = {instancePath:instancePath+"/displayName",schemaPath:"#/properties/displayName/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err11 = {instancePath:instancePath+"/displayName",schemaPath:"#/properties/displayName/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
else {
errors = _errs5;
if(vErrors !== null){
if(_errs5){
vErrors.length = _errs5;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceIds !== undefined){
let data2 = data.sourceIds;
if(Array.isArray(data2)){
const len0 = data2.length;
for(let i0=0; i0<len0; i0++){
let data3 = data2[i0];
if(typeof data3 === "string"){
if(!pattern8.test(data3)){
const err12 = {instancePath:instancePath+"/sourceIds/" + i0,schemaPath:"#/properties/sourceIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/sourceIds/" + i0,schemaPath:"#/properties/sourceIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/sourceIds",schemaPath:"#/properties/sourceIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.sourceNames !== undefined){
let data4 = data.sourceNames;
if(Array.isArray(data4)){
const len1 = data4.length;
for(let i1=0; i1<len1; i1++){
let data5 = data4[i1];
if(typeof data5 === "string"){
if(!pattern0.test(data5)){
const err15 = {instancePath:instancePath+"/sourceNames/" + i1,schemaPath:"#/properties/sourceNames/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/sourceNames/" + i1,schemaPath:"#/properties/sourceNames/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
}
else {
const err17 = {instancePath:instancePath+"/sourceNames",schemaPath:"#/properties/sourceNames/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.kind !== undefined){
let data6 = data.kind;
if(!(((data6 === "individual") || (data6 === "collective")) || (data6 === "unknown"))){
const err18 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema16.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
validate23.errors = vErrors;
return errors === 0;
}

export const validateArtistMapping = validate24;
const schema17 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"[\\s\\S]"},"eventId":{"type":"string","pattern":"[\\s\\S]"},"attendanceId":{"type":"string","pattern":"[\\s\\S]"},"magicconNames":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"artistKeys":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"sourceArtistIds":{"type":"array","items":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"}},"scryfallNames":{"type":"object","additionalProperties":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}}},"status":{"enum":["verified","review_needed","unmatched"]},"method":{"type":"string","pattern":"[\\s\\S]"},"evidenceUrls":{"type":"array","items":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"}},"reviewedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},"notes":{"type":"string"}},"required":["id","eventId","attendanceId","magicconNames","artistKeys","sourceArtistIds","scryfallNames","status","method","evidenceUrls","reviewedAt","notes"]};
const pattern43 = new RegExp("^\\d{4}-\\d{2}-\\d{2}$", "u");

function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.eventId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventId"},message:"must have required property '"+"eventId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.attendanceId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "attendanceId"},message:"must have required property '"+"attendanceId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.magicconNames === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "magicconNames"},message:"must have required property '"+"magicconNames"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.artistKeys === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artistKeys"},message:"must have required property '"+"artistKeys"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.sourceArtistIds === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceArtistIds"},message:"must have required property '"+"sourceArtistIds"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.scryfallNames === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scryfallNames"},message:"must have required property '"+"scryfallNames"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.status === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.method === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "method"},message:"must have required property '"+"method"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.evidenceUrls === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "evidenceUrls"},message:"must have required property '"+"evidenceUrls"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.reviewedAt === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "reviewedAt"},message:"must have required property '"+"reviewedAt"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.notes === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema17.properties, key0))){
const err12 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err13 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.eventId !== undefined){
let data1 = data.eventId;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err15 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.attendanceId !== undefined){
let data2 = data.attendanceId;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err17 = {instancePath:instancePath+"/attendanceId",schemaPath:"#/properties/attendanceId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/attendanceId",schemaPath:"#/properties/attendanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.magicconNames !== undefined){
let data3 = data.magicconNames;
if(Array.isArray(data3)){
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
let data4 = data3[i0];
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err19 = {instancePath:instancePath+"/magicconNames/" + i0,schemaPath:"#/properties/magicconNames/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/magicconNames/" + i0,schemaPath:"#/properties/magicconNames/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
else {
const err21 = {instancePath:instancePath+"/magicconNames",schemaPath:"#/properties/magicconNames/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.artistKeys !== undefined){
let data5 = data.artistKeys;
if(Array.isArray(data5)){
const len1 = data5.length;
for(let i1=0; i1<len1; i1++){
let data6 = data5[i1];
if(typeof data6 === "string"){
if(!pattern0.test(data6)){
const err22 = {instancePath:instancePath+"/artistKeys/" + i1,schemaPath:"#/properties/artistKeys/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/artistKeys/" + i1,schemaPath:"#/properties/artistKeys/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/artistKeys",schemaPath:"#/properties/artistKeys/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.sourceArtistIds !== undefined){
let data7 = data.sourceArtistIds;
if(Array.isArray(data7)){
const len2 = data7.length;
for(let i2=0; i2<len2; i2++){
let data8 = data7[i2];
if(typeof data8 === "string"){
if(!pattern8.test(data8)){
const err25 = {instancePath:instancePath+"/sourceArtistIds/" + i2,schemaPath:"#/properties/sourceArtistIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/sourceArtistIds/" + i2,schemaPath:"#/properties/sourceArtistIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/sourceArtistIds",schemaPath:"#/properties/sourceArtistIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.scryfallNames !== undefined){
let data9 = data.scryfallNames;
if(data9 && typeof data9 == "object" && !Array.isArray(data9)){
for(const key1 in data9){
let data10 = data9[key1];
if(Array.isArray(data10)){
const len3 = data10.length;
for(let i3=0; i3<len3; i3++){
let data11 = data10[i3];
if(typeof data11 === "string"){
if(!pattern0.test(data11)){
const err28 = {instancePath:instancePath+"/scryfallNames/" + key1.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i3,schemaPath:"#/properties/scryfallNames/additionalProperties/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/scryfallNames/" + key1.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i3,schemaPath:"#/properties/scryfallNames/additionalProperties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath:instancePath+"/scryfallNames/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/scryfallNames/additionalProperties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/scryfallNames",schemaPath:"#/properties/scryfallNames/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.status !== undefined){
let data12 = data.status;
if(!(((data12 === "verified") || (data12 === "review_needed")) || (data12 === "unmatched"))){
const err32 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema17.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data.method !== undefined){
let data13 = data.method;
if(typeof data13 === "string"){
if(!pattern0.test(data13)){
const err33 = {instancePath:instancePath+"/method",schemaPath:"#/properties/method/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
else {
const err34 = {instancePath:instancePath+"/method",schemaPath:"#/properties/method/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
if(data.evidenceUrls !== undefined){
let data14 = data.evidenceUrls;
if(Array.isArray(data14)){
const len4 = data14.length;
for(let i4=0; i4<len4; i4++){
let data15 = data14[i4];
if(typeof data15 === "string"){
if(!pattern2.test(data15)){
const err35 = {instancePath:instancePath+"/evidenceUrls/" + i4,schemaPath:"#/properties/evidenceUrls/items/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
else {
const err36 = {instancePath:instancePath+"/evidenceUrls/" + i4,schemaPath:"#/properties/evidenceUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
}
else {
const err37 = {instancePath:instancePath+"/evidenceUrls",schemaPath:"#/properties/evidenceUrls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data.reviewedAt !== undefined){
let data16 = data.reviewedAt;
if(typeof data16 === "string"){
if(!pattern43.test(data16)){
const err38 = {instancePath:instancePath+"/reviewedAt",schemaPath:"#/properties/reviewedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
else {
const err39 = {instancePath:instancePath+"/reviewedAt",schemaPath:"#/properties/reviewedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data.notes !== undefined){
if(typeof data.notes !== "string"){
const err40 = {instancePath:instancePath+"/notes",schemaPath:"#/properties/notes/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
}
else {
const err41 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
validate24.errors = vErrors;
return errors === 0;
}

export const validateArtistLink = validate25;
const schema18 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"[\\s\\S]"},"type":{"type":"string","pattern":"[\\s\\S]"},"platform":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"label":{"type":"string","pattern":"[\\s\\S]"},"originalUrl":{"anyOf":[{"type":"string"},{"type":"null"}]},"displayUrl":{"anyOf":[{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},{"type":"null"}]},"sourceProfileUrl":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},"retrievedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"}},"required":["id","type","platform","label","originalUrl","displayUrl","sourceProfileUrl","retrievedAt"]};

function validate25(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.type === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.platform === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "platform"},message:"must have required property '"+"platform"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.label === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.originalUrl === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "originalUrl"},message:"must have required property '"+"originalUrl"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.displayUrl === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "displayUrl"},message:"must have required property '"+"displayUrl"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.sourceProfileUrl === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceProfileUrl"},message:"must have required property '"+"sourceProfileUrl"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.retrievedAt === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "type")) || (key0 === "platform")) || (key0 === "label")) || (key0 === "originalUrl")) || (key0 === "displayUrl")) || (key0 === "sourceProfileUrl")) || (key0 === "retrievedAt"))){
const err8 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err9 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.type !== undefined){
let data1 = data.type;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err11 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.platform !== undefined){
let data2 = data.platform;
const _errs7 = errors;
let valid1 = false;
const _errs8 = errors;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err13 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs10 = errors;
if(data2 !== null){
const err15 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err16 = {instancePath:instancePath+"/platform",schemaPath:"#/properties/platform/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
else {
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
}
}
if(data.label !== undefined){
let data3 = data.label;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err17 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.originalUrl !== undefined){
let data4 = data.originalUrl;
const _errs15 = errors;
let valid2 = false;
const _errs16 = errors;
if(typeof data4 !== "string"){
const err19 = {instancePath:instancePath+"/originalUrl",schemaPath:"#/properties/originalUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid1 = _errs16 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs18 = errors;
if(data4 !== null){
const err20 = {instancePath:instancePath+"/originalUrl",schemaPath:"#/properties/originalUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var _valid1 = _errs18 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err21 = {instancePath:instancePath+"/originalUrl",schemaPath:"#/properties/originalUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
else {
errors = _errs15;
if(vErrors !== null){
if(_errs15){
vErrors.length = _errs15;
}
else {
vErrors = null;
}
}
}
}
if(data.displayUrl !== undefined){
let data5 = data.displayUrl;
const _errs21 = errors;
let valid3 = false;
const _errs22 = errors;
if(typeof data5 === "string"){
if(!pattern2.test(data5)){
const err22 = {instancePath:instancePath+"/displayUrl",schemaPath:"#/properties/displayUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/displayUrl",schemaPath:"#/properties/displayUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
var _valid2 = _errs22 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs24 = errors;
if(data5 !== null){
const err24 = {instancePath:instancePath+"/displayUrl",schemaPath:"#/properties/displayUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
var _valid2 = _errs24 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err25 = {instancePath:instancePath+"/displayUrl",schemaPath:"#/properties/displayUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
else {
errors = _errs21;
if(vErrors !== null){
if(_errs21){
vErrors.length = _errs21;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceProfileUrl !== undefined){
let data6 = data.sourceProfileUrl;
if(typeof data6 === "string"){
if(!pattern2.test(data6)){
const err26 = {instancePath:instancePath+"/sourceProfileUrl",schemaPath:"#/properties/sourceProfileUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/sourceProfileUrl",schemaPath:"#/properties/sourceProfileUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.retrievedAt !== undefined){
let data7 = data.retrievedAt;
if(typeof data7 === "string"){
if(!pattern3.test(data7)){
const err28 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
validate25.errors = vErrors;
return errors === 0;
}

export const validateAttendance = validate26;
const schema19 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"[\\s\\S]"},"eventId":{"type":"string","pattern":"[\\s\\S]"},"rawName":{"type":"string","pattern":"[\\s\\S]"},"guestId":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"mappingId":{"type":"string","pattern":"[\\s\\S]"},"profileUrl":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},"portraitUrl":{"anyOf":[{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},{"type":"null"}]},"portraitAttribution":{"type":"string","pattern":"[\\s\\S]"},"booth":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"days":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"status":{"enum":["listed","cancelled","unknown"]},"sourceUrls":{"type":"array","items":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"}},"links":{"type":"array","items":{"$ref":"#/$defs/ArtistLink"}}},"required":["id","eventId","rawName","guestId","mappingId","profileUrl","portraitUrl","portraitAttribution","booth","days","status","sourceUrls","links"]};

function validate26(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.eventId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventId"},message:"must have required property '"+"eventId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.rawName === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rawName"},message:"must have required property '"+"rawName"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.guestId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "guestId"},message:"must have required property '"+"guestId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.mappingId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mappingId"},message:"must have required property '"+"mappingId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.profileUrl === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "profileUrl"},message:"must have required property '"+"profileUrl"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.portraitUrl === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "portraitUrl"},message:"must have required property '"+"portraitUrl"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.portraitAttribution === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "portraitAttribution"},message:"must have required property '"+"portraitAttribution"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.booth === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "booth"},message:"must have required property '"+"booth"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.days === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "days"},message:"must have required property '"+"days"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.status === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.sourceUrls === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceUrls"},message:"must have required property '"+"sourceUrls"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data.links === undefined){
const err12 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "links"},message:"must have required property '"+"links"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema19.properties, key0))){
const err13 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err14 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.eventId !== undefined){
let data1 = data.eventId;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err16 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.rawName !== undefined){
let data2 = data.rawName;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err18 = {instancePath:instancePath+"/rawName",schemaPath:"#/properties/rawName/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/rawName",schemaPath:"#/properties/rawName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.guestId !== undefined){
let data3 = data.guestId;
const _errs9 = errors;
let valid1 = false;
const _errs10 = errors;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err20 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs12 = errors;
if(data3 !== null){
const err22 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var _valid0 = _errs12 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err23 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
if(data.mappingId !== undefined){
let data4 = data.mappingId;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err24 = {instancePath:instancePath+"/mappingId",schemaPath:"#/properties/mappingId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/mappingId",schemaPath:"#/properties/mappingId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.profileUrl !== undefined){
let data5 = data.profileUrl;
if(typeof data5 === "string"){
if(!pattern2.test(data5)){
const err26 = {instancePath:instancePath+"/profileUrl",schemaPath:"#/properties/profileUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/profileUrl",schemaPath:"#/properties/profileUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.portraitUrl !== undefined){
let data6 = data.portraitUrl;
const _errs19 = errors;
let valid2 = false;
const _errs20 = errors;
if(typeof data6 === "string"){
if(!pattern2.test(data6)){
const err28 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid1 = _errs20 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs22 = errors;
if(data6 !== null){
const err30 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
var _valid1 = _errs22 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err31 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
else {
errors = _errs19;
if(vErrors !== null){
if(_errs19){
vErrors.length = _errs19;
}
else {
vErrors = null;
}
}
}
}
if(data.portraitAttribution !== undefined){
let data7 = data.portraitAttribution;
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err32 = {instancePath:instancePath+"/portraitAttribution",schemaPath:"#/properties/portraitAttribution/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
else {
const err33 = {instancePath:instancePath+"/portraitAttribution",schemaPath:"#/properties/portraitAttribution/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data.booth !== undefined){
let data8 = data.booth;
const _errs27 = errors;
let valid3 = false;
const _errs28 = errors;
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err34 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid2 = _errs28 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs30 = errors;
if(data8 !== null){
const err36 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
var _valid2 = _errs30 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err37 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
else {
errors = _errs27;
if(vErrors !== null){
if(_errs27){
vErrors.length = _errs27;
}
else {
vErrors = null;
}
}
}
}
if(data.days !== undefined){
let data9 = data.days;
if(Array.isArray(data9)){
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
let data10 = data9[i0];
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err38 = {instancePath:instancePath+"/days/" + i0,schemaPath:"#/properties/days/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
else {
const err39 = {instancePath:instancePath+"/days/" + i0,schemaPath:"#/properties/days/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
}
else {
const err40 = {instancePath:instancePath+"/days",schemaPath:"#/properties/days/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
if(data.status !== undefined){
let data11 = data.status;
if(!(((data11 === "listed") || (data11 === "cancelled")) || (data11 === "unknown"))){
const err41 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema19.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.sourceUrls !== undefined){
let data12 = data.sourceUrls;
if(Array.isArray(data12)){
const len1 = data12.length;
for(let i1=0; i1<len1; i1++){
let data13 = data12[i1];
if(typeof data13 === "string"){
if(!pattern2.test(data13)){
const err42 = {instancePath:instancePath+"/sourceUrls/" + i1,schemaPath:"#/properties/sourceUrls/items/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
else {
const err43 = {instancePath:instancePath+"/sourceUrls/" + i1,schemaPath:"#/properties/sourceUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
}
else {
const err44 = {instancePath:instancePath+"/sourceUrls",schemaPath:"#/properties/sourceUrls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data.links !== undefined){
let data14 = data.links;
if(Array.isArray(data14)){
const len2 = data14.length;
for(let i2=0; i2<len2; i2++){
let data15 = data14[i2];
if(data15 && typeof data15 == "object" && !Array.isArray(data15)){
if(data15.id === undefined){
const err45 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if(data15.type === undefined){
const err46 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
if(data15.platform === undefined){
const err47 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "platform"},message:"must have required property '"+"platform"+"'"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
if(data15.label === undefined){
const err48 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
if(data15.originalUrl === undefined){
const err49 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "originalUrl"},message:"must have required property '"+"originalUrl"+"'"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(data15.displayUrl === undefined){
const err50 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "displayUrl"},message:"must have required property '"+"displayUrl"+"'"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
if(data15.sourceProfileUrl === undefined){
const err51 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "sourceProfileUrl"},message:"must have required property '"+"sourceProfileUrl"+"'"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
if(data15.retrievedAt === undefined){
const err52 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
for(const key1 in data15){
if(!((((((((key1 === "id") || (key1 === "type")) || (key1 === "platform")) || (key1 === "label")) || (key1 === "originalUrl")) || (key1 === "displayUrl")) || (key1 === "sourceProfileUrl")) || (key1 === "retrievedAt"))){
const err53 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data15.id !== undefined){
let data16 = data15.id;
if(typeof data16 === "string"){
if(!pattern0.test(data16)){
const err54 = {instancePath:instancePath+"/links/" + i2+"/id",schemaPath:"#/$defs/ArtistLink/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/links/" + i2+"/id",schemaPath:"#/$defs/ArtistLink/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data15.type !== undefined){
let data17 = data15.type;
if(typeof data17 === "string"){
if(!pattern0.test(data17)){
const err56 = {instancePath:instancePath+"/links/" + i2+"/type",schemaPath:"#/$defs/ArtistLink/properties/type/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
else {
const err57 = {instancePath:instancePath+"/links/" + i2+"/type",schemaPath:"#/$defs/ArtistLink/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
if(data15.platform !== undefined){
let data18 = data15.platform;
const _errs52 = errors;
let valid12 = false;
const _errs53 = errors;
if(typeof data18 === "string"){
if(!pattern0.test(data18)){
const err58 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
else {
const err59 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
var _valid3 = _errs53 === errors;
valid12 = valid12 || _valid3;
if(!valid12){
const _errs55 = errors;
if(data18 !== null){
const err60 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
var _valid3 = _errs55 === errors;
valid12 = valid12 || _valid3;
}
if(!valid12){
const err61 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
else {
errors = _errs52;
if(vErrors !== null){
if(_errs52){
vErrors.length = _errs52;
}
else {
vErrors = null;
}
}
}
}
if(data15.label !== undefined){
let data19 = data15.label;
if(typeof data19 === "string"){
if(!pattern0.test(data19)){
const err62 = {instancePath:instancePath+"/links/" + i2+"/label",schemaPath:"#/$defs/ArtistLink/properties/label/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
else {
const err63 = {instancePath:instancePath+"/links/" + i2+"/label",schemaPath:"#/$defs/ArtistLink/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data15.originalUrl !== undefined){
let data20 = data15.originalUrl;
const _errs60 = errors;
let valid13 = false;
const _errs61 = errors;
if(typeof data20 !== "string"){
const err64 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
var _valid4 = _errs61 === errors;
valid13 = valid13 || _valid4;
if(!valid13){
const _errs63 = errors;
if(data20 !== null){
const err65 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
var _valid4 = _errs63 === errors;
valid13 = valid13 || _valid4;
}
if(!valid13){
const err66 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
else {
errors = _errs60;
if(vErrors !== null){
if(_errs60){
vErrors.length = _errs60;
}
else {
vErrors = null;
}
}
}
}
if(data15.displayUrl !== undefined){
let data21 = data15.displayUrl;
const _errs66 = errors;
let valid14 = false;
const _errs67 = errors;
if(typeof data21 === "string"){
if(!pattern2.test(data21)){
const err67 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
else {
const err68 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
var _valid5 = _errs67 === errors;
valid14 = valid14 || _valid5;
if(!valid14){
const _errs69 = errors;
if(data21 !== null){
const err69 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
var _valid5 = _errs69 === errors;
valid14 = valid14 || _valid5;
}
if(!valid14){
const err70 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
else {
errors = _errs66;
if(vErrors !== null){
if(_errs66){
vErrors.length = _errs66;
}
else {
vErrors = null;
}
}
}
}
if(data15.sourceProfileUrl !== undefined){
let data22 = data15.sourceProfileUrl;
if(typeof data22 === "string"){
if(!pattern2.test(data22)){
const err71 = {instancePath:instancePath+"/links/" + i2+"/sourceProfileUrl",schemaPath:"#/$defs/ArtistLink/properties/sourceProfileUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
else {
const err72 = {instancePath:instancePath+"/links/" + i2+"/sourceProfileUrl",schemaPath:"#/$defs/ArtistLink/properties/sourceProfileUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data15.retrievedAt !== undefined){
let data23 = data15.retrievedAt;
if(typeof data23 === "string"){
if(!pattern3.test(data23)){
const err73 = {instancePath:instancePath+"/links/" + i2+"/retrievedAt",schemaPath:"#/$defs/ArtistLink/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
else {
const err74 = {instancePath:instancePath+"/links/" + i2+"/retrievedAt",schemaPath:"#/$defs/ArtistLink/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
}
else {
const err75 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
}
else {
const err76 = {instancePath:instancePath+"/links",schemaPath:"#/properties/links/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
else {
const err77 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
validate26.errors = vErrors;
return errors === 0;
}

export const validateArtistStatistics = validate27;
const schema21 = {"type":"object","additionalProperties":false,"properties":{"artistKey":{"type":"string","pattern":"[\\s\\S]"},"snapshotId":{"type":"string","pattern":"[\\s\\S]"},"scope":{"type":"string","pattern":"[\\s\\S]"},"uniqueCards":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"printingEditions":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"languagePrintings":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"uniqueArtworks":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"supplementalObjects":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"missingOracleIds":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]},"missingIllustrations":{"anyOf":[{"type":"integer","minimum":0},{"type":"null"}]}},"required":["artistKey","snapshotId","scope","uniqueCards","printingEditions","languagePrintings","uniqueArtworks","supplementalObjects","missingOracleIds","missingIllustrations"]};

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.artistKey === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artistKey"},message:"must have required property '"+"artistKey"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.snapshotId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "snapshotId"},message:"must have required property '"+"snapshotId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.scope === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "scope"},message:"must have required property '"+"scope"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.uniqueCards === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "uniqueCards"},message:"must have required property '"+"uniqueCards"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.printingEditions === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "printingEditions"},message:"must have required property '"+"printingEditions"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.languagePrintings === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "languagePrintings"},message:"must have required property '"+"languagePrintings"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.uniqueArtworks === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "uniqueArtworks"},message:"must have required property '"+"uniqueArtworks"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.supplementalObjects === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "supplementalObjects"},message:"must have required property '"+"supplementalObjects"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.missingOracleIds === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "missingOracleIds"},message:"must have required property '"+"missingOracleIds"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.missingIllustrations === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "missingIllustrations"},message:"must have required property '"+"missingIllustrations"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema21.properties, key0))){
const err10 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.artistKey !== undefined){
let data0 = data.artistKey;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err11 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.snapshotId !== undefined){
let data1 = data.snapshotId;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err13 = {instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.scope !== undefined){
let data2 = data.scope;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err15 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/scope",schemaPath:"#/properties/scope/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.uniqueCards !== undefined){
let data3 = data.uniqueCards;
const _errs9 = errors;
let valid1 = false;
const _errs10 = errors;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err17 = {instancePath:instancePath+"/uniqueCards",schemaPath:"#/properties/uniqueCards/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 < 0 || isNaN(data3)){
const err18 = {instancePath:instancePath+"/uniqueCards",schemaPath:"#/properties/uniqueCards/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs12 = errors;
if(data3 !== null){
const err19 = {instancePath:instancePath+"/uniqueCards",schemaPath:"#/properties/uniqueCards/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid0 = _errs12 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err20 = {instancePath:instancePath+"/uniqueCards",schemaPath:"#/properties/uniqueCards/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
if(data.printingEditions !== undefined){
let data4 = data.printingEditions;
const _errs15 = errors;
let valid2 = false;
const _errs16 = errors;
if(!(((typeof data4 == "number") && (!(data4 % 1) && !isNaN(data4))) && (isFinite(data4)))){
const err21 = {instancePath:instancePath+"/printingEditions",schemaPath:"#/properties/printingEditions/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if((typeof data4 == "number") && (isFinite(data4))){
if(data4 < 0 || isNaN(data4)){
const err22 = {instancePath:instancePath+"/printingEditions",schemaPath:"#/properties/printingEditions/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
var _valid1 = _errs16 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs18 = errors;
if(data4 !== null){
const err23 = {instancePath:instancePath+"/printingEditions",schemaPath:"#/properties/printingEditions/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
var _valid1 = _errs18 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err24 = {instancePath:instancePath+"/printingEditions",schemaPath:"#/properties/printingEditions/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
else {
errors = _errs15;
if(vErrors !== null){
if(_errs15){
vErrors.length = _errs15;
}
else {
vErrors = null;
}
}
}
}
if(data.languagePrintings !== undefined){
let data5 = data.languagePrintings;
const _errs21 = errors;
let valid3 = false;
const _errs22 = errors;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err25 = {instancePath:instancePath+"/languagePrintings",schemaPath:"#/properties/languagePrintings/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 < 0 || isNaN(data5)){
const err26 = {instancePath:instancePath+"/languagePrintings",schemaPath:"#/properties/languagePrintings/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
var _valid2 = _errs22 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs24 = errors;
if(data5 !== null){
const err27 = {instancePath:instancePath+"/languagePrintings",schemaPath:"#/properties/languagePrintings/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
var _valid2 = _errs24 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err28 = {instancePath:instancePath+"/languagePrintings",schemaPath:"#/properties/languagePrintings/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
else {
errors = _errs21;
if(vErrors !== null){
if(_errs21){
vErrors.length = _errs21;
}
else {
vErrors = null;
}
}
}
}
if(data.uniqueArtworks !== undefined){
let data6 = data.uniqueArtworks;
const _errs27 = errors;
let valid4 = false;
const _errs28 = errors;
if(!(((typeof data6 == "number") && (!(data6 % 1) && !isNaN(data6))) && (isFinite(data6)))){
const err29 = {instancePath:instancePath+"/uniqueArtworks",schemaPath:"#/properties/uniqueArtworks/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if((typeof data6 == "number") && (isFinite(data6))){
if(data6 < 0 || isNaN(data6)){
const err30 = {instancePath:instancePath+"/uniqueArtworks",schemaPath:"#/properties/uniqueArtworks/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
var _valid3 = _errs28 === errors;
valid4 = valid4 || _valid3;
if(!valid4){
const _errs30 = errors;
if(data6 !== null){
const err31 = {instancePath:instancePath+"/uniqueArtworks",schemaPath:"#/properties/uniqueArtworks/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
var _valid3 = _errs30 === errors;
valid4 = valid4 || _valid3;
}
if(!valid4){
const err32 = {instancePath:instancePath+"/uniqueArtworks",schemaPath:"#/properties/uniqueArtworks/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
else {
errors = _errs27;
if(vErrors !== null){
if(_errs27){
vErrors.length = _errs27;
}
else {
vErrors = null;
}
}
}
}
if(data.supplementalObjects !== undefined){
let data7 = data.supplementalObjects;
const _errs33 = errors;
let valid5 = false;
const _errs34 = errors;
if(!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))){
const err33 = {instancePath:instancePath+"/supplementalObjects",schemaPath:"#/properties/supplementalObjects/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if((typeof data7 == "number") && (isFinite(data7))){
if(data7 < 0 || isNaN(data7)){
const err34 = {instancePath:instancePath+"/supplementalObjects",schemaPath:"#/properties/supplementalObjects/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
var _valid4 = _errs34 === errors;
valid5 = valid5 || _valid4;
if(!valid5){
const _errs36 = errors;
if(data7 !== null){
const err35 = {instancePath:instancePath+"/supplementalObjects",schemaPath:"#/properties/supplementalObjects/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid4 = _errs36 === errors;
valid5 = valid5 || _valid4;
}
if(!valid5){
const err36 = {instancePath:instancePath+"/supplementalObjects",schemaPath:"#/properties/supplementalObjects/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
else {
errors = _errs33;
if(vErrors !== null){
if(_errs33){
vErrors.length = _errs33;
}
else {
vErrors = null;
}
}
}
}
if(data.missingOracleIds !== undefined){
let data8 = data.missingOracleIds;
const _errs39 = errors;
let valid6 = false;
const _errs40 = errors;
if(!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))){
const err37 = {instancePath:instancePath+"/missingOracleIds",schemaPath:"#/properties/missingOracleIds/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if((typeof data8 == "number") && (isFinite(data8))){
if(data8 < 0 || isNaN(data8)){
const err38 = {instancePath:instancePath+"/missingOracleIds",schemaPath:"#/properties/missingOracleIds/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
var _valid5 = _errs40 === errors;
valid6 = valid6 || _valid5;
if(!valid6){
const _errs42 = errors;
if(data8 !== null){
const err39 = {instancePath:instancePath+"/missingOracleIds",schemaPath:"#/properties/missingOracleIds/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
var _valid5 = _errs42 === errors;
valid6 = valid6 || _valid5;
}
if(!valid6){
const err40 = {instancePath:instancePath+"/missingOracleIds",schemaPath:"#/properties/missingOracleIds/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
else {
errors = _errs39;
if(vErrors !== null){
if(_errs39){
vErrors.length = _errs39;
}
else {
vErrors = null;
}
}
}
}
if(data.missingIllustrations !== undefined){
let data9 = data.missingIllustrations;
const _errs45 = errors;
let valid7 = false;
const _errs46 = errors;
if(!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))){
const err41 = {instancePath:instancePath+"/missingIllustrations",schemaPath:"#/properties/missingIllustrations/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if((typeof data9 == "number") && (isFinite(data9))){
if(data9 < 0 || isNaN(data9)){
const err42 = {instancePath:instancePath+"/missingIllustrations",schemaPath:"#/properties/missingIllustrations/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
var _valid6 = _errs46 === errors;
valid7 = valid7 || _valid6;
if(!valid7){
const _errs48 = errors;
if(data9 !== null){
const err43 = {instancePath:instancePath+"/missingIllustrations",schemaPath:"#/properties/missingIllustrations/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
var _valid6 = _errs48 === errors;
valid7 = valid7 || _valid6;
}
if(!valid7){
const err44 = {instancePath:instancePath+"/missingIllustrations",schemaPath:"#/properties/missingIllustrations/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
else {
errors = _errs45;
if(vErrors !== null){
if(_errs45){
vErrors.length = _errs45;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err45 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
validate27.errors = vErrors;
return errors === 0;
}

export const validateEvent = validate28;
const schema22 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"[\\s\\S]"},"name":{"type":"string","pattern":"[\\s\\S]"},"startsAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},"endsAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}$"},"location":{"type":"string","pattern":"[\\s\\S]"},"directoryUrl":{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},"snapshotId":{"type":"string","pattern":"[\\s\\S]"},"retrievedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"}},"required":["id","name","startsAt","endsAt","location","directoryUrl","snapshotId","retrievedAt"]};

function validate28(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.name === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.startsAt === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "startsAt"},message:"must have required property '"+"startsAt"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.endsAt === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "endsAt"},message:"must have required property '"+"endsAt"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.location === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "location"},message:"must have required property '"+"location"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.directoryUrl === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "directoryUrl"},message:"must have required property '"+"directoryUrl"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.snapshotId === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "snapshotId"},message:"must have required property '"+"snapshotId"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.retrievedAt === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
for(const key0 in data){
if(!((((((((key0 === "id") || (key0 === "name")) || (key0 === "startsAt")) || (key0 === "endsAt")) || (key0 === "location")) || (key0 === "directoryUrl")) || (key0 === "snapshotId")) || (key0 === "retrievedAt"))){
const err8 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err9 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.name !== undefined){
let data1 = data.name;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err11 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
else {
const err12 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.startsAt !== undefined){
let data2 = data.startsAt;
if(typeof data2 === "string"){
if(!pattern43.test(data2)){
const err13 = {instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
else {
const err14 = {instancePath:instancePath+"/startsAt",schemaPath:"#/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.endsAt !== undefined){
let data3 = data.endsAt;
if(typeof data3 === "string"){
if(!pattern43.test(data3)){
const err15 = {instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/endsAt",schemaPath:"#/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.location !== undefined){
let data4 = data.location;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err17 = {instancePath:instancePath+"/location",schemaPath:"#/properties/location/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
else {
const err18 = {instancePath:instancePath+"/location",schemaPath:"#/properties/location/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data.directoryUrl !== undefined){
let data5 = data.directoryUrl;
if(typeof data5 === "string"){
if(!pattern2.test(data5)){
const err19 = {instancePath:instancePath+"/directoryUrl",schemaPath:"#/properties/directoryUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/directoryUrl",schemaPath:"#/properties/directoryUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.snapshotId !== undefined){
let data6 = data.snapshotId;
if(typeof data6 === "string"){
if(!pattern0.test(data6)){
const err21 = {instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
else {
const err22 = {instancePath:instancePath+"/snapshotId",schemaPath:"#/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data.retrievedAt !== undefined){
let data7 = data.retrievedAt;
if(typeof data7 === "string"){
if(!pattern3.test(data7)){
const err23 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/retrievedAt",schemaPath:"#/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
validate28.errors = vErrors;
return errors === 0;
}

export const validateSavedDeck = validate29;
const schema23 = {"type":"object","additionalProperties":false,"properties":{"id":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},"provider":{"enum":["moxfield","archidekt","file"]},"sourceDeckId":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"sourceUrl":{"anyOf":[{"type":"string","pattern":"^[hH][tT][tT][pP][sS]?://[^\\s]+$"},{"type":"null"}]},"title":{"type":"string","pattern":"[\\s\\S]"},"importedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},"refreshedAt":{"anyOf":[{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},{"type":"null"}]},"sourceChecksum":{"type":"string","pattern":"^[0-9a-f]{64}$"},"schemaVersion":{"const":1},"dataVersion":{"type":"string","pattern":"[\\s\\S]"},"mappingRevision":{"type":"string","pattern":"[\\s\\S]"}},"required":["id","provider","sourceDeckId","sourceUrl","title","importedAt","refreshedAt","sourceChecksum","schemaVersion","dataVersion","mappingRevision"]};

function validate29(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.provider === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "provider"},message:"must have required property '"+"provider"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.sourceDeckId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceDeckId"},message:"must have required property '"+"sourceDeckId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sourceUrl === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceUrl"},message:"must have required property '"+"sourceUrl"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.title === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.importedAt === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "importedAt"},message:"must have required property '"+"importedAt"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.refreshedAt === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "refreshedAt"},message:"must have required property '"+"refreshedAt"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.sourceChecksum === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceChecksum"},message:"must have required property '"+"sourceChecksum"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.schemaVersion === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.dataVersion === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "dataVersion"},message:"must have required property '"+"dataVersion"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.mappingRevision === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mappingRevision"},message:"must have required property '"+"mappingRevision"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema23.properties, key0))){
const err11 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern8.test(data0)){
const err12 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.provider !== undefined){
let data1 = data.provider;
if(!(((data1 === "moxfield") || (data1 === "archidekt")) || (data1 === "file"))){
const err14 = {instancePath:instancePath+"/provider",schemaPath:"#/properties/provider/enum",keyword:"enum",params:{allowedValues: schema23.properties.provider.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.sourceDeckId !== undefined){
let data2 = data.sourceDeckId;
const _errs6 = errors;
let valid1 = false;
const _errs7 = errors;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err15 = {instancePath:instancePath+"/sourceDeckId",schemaPath:"#/properties/sourceDeckId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/sourceDeckId",schemaPath:"#/properties/sourceDeckId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var _valid0 = _errs7 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs9 = errors;
if(data2 !== null){
const err17 = {instancePath:instancePath+"/sourceDeckId",schemaPath:"#/properties/sourceDeckId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
var _valid0 = _errs9 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err18 = {instancePath:instancePath+"/sourceDeckId",schemaPath:"#/properties/sourceDeckId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
else {
errors = _errs6;
if(vErrors !== null){
if(_errs6){
vErrors.length = _errs6;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceUrl !== undefined){
let data3 = data.sourceUrl;
const _errs12 = errors;
let valid2 = false;
const _errs13 = errors;
if(typeof data3 === "string"){
if(!pattern2.test(data3)){
const err19 = {instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
else {
const err20 = {instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var _valid1 = _errs13 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs15 = errors;
if(data3 !== null){
const err21 = {instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
var _valid1 = _errs15 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err22 = {instancePath:instancePath+"/sourceUrl",schemaPath:"#/properties/sourceUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
else {
errors = _errs12;
if(vErrors !== null){
if(_errs12){
vErrors.length = _errs12;
}
else {
vErrors = null;
}
}
}
}
if(data.title !== undefined){
let data4 = data.title;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err23 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
else {
const err24 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.importedAt !== undefined){
let data5 = data.importedAt;
if(typeof data5 === "string"){
if(!pattern3.test(data5)){
const err25 = {instancePath:instancePath+"/importedAt",schemaPath:"#/properties/importedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/importedAt",schemaPath:"#/properties/importedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.refreshedAt !== undefined){
let data6 = data.refreshedAt;
const _errs22 = errors;
let valid3 = false;
const _errs23 = errors;
if(typeof data6 === "string"){
if(!pattern3.test(data6)){
const err27 = {instancePath:instancePath+"/refreshedAt",schemaPath:"#/properties/refreshedAt/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
else {
const err28 = {instancePath:instancePath+"/refreshedAt",schemaPath:"#/properties/refreshedAt/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
var _valid2 = _errs23 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs25 = errors;
if(data6 !== null){
const err29 = {instancePath:instancePath+"/refreshedAt",schemaPath:"#/properties/refreshedAt/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid2 = _errs25 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err30 = {instancePath:instancePath+"/refreshedAt",schemaPath:"#/properties/refreshedAt/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
else {
errors = _errs22;
if(vErrors !== null){
if(_errs22){
vErrors.length = _errs22;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceChecksum !== undefined){
let data7 = data.sourceChecksum;
if(typeof data7 === "string"){
if(!pattern5.test(data7)){
const err31 = {instancePath:instancePath+"/sourceChecksum",schemaPath:"#/properties/sourceChecksum/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
else {
const err32 = {instancePath:instancePath+"/sourceChecksum",schemaPath:"#/properties/sourceChecksum/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(1 !== data.schemaVersion){
const err33 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data.dataVersion !== undefined){
let data9 = data.dataVersion;
if(typeof data9 === "string"){
if(!pattern0.test(data9)){
const err34 = {instancePath:instancePath+"/dataVersion",schemaPath:"#/properties/dataVersion/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/dataVersion",schemaPath:"#/properties/dataVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data.mappingRevision !== undefined){
let data10 = data.mappingRevision;
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err36 = {instancePath:instancePath+"/mappingRevision",schemaPath:"#/properties/mappingRevision/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
else {
const err37 = {instancePath:instancePath+"/mappingRevision",schemaPath:"#/properties/mappingRevision/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
}
else {
const err38 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
validate29.errors = vErrors;
return errors === 0;
}

export const validateDeckLine = validate30;
const schema24 = {"type":"object","additionalProperties":false,"properties":{"deckId":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},"sourceLineKey":{"type":"string","pattern":"[\\s\\S]"},"sourcePrintingId":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"sourceScryfallId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"name":{"type":"string","pattern":"[\\s\\S]"},"quantity":{"type":"integer","minimum":1},"section":{"type":"string","pattern":"[\\s\\S]"},"categories":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"setCode":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"collectorNumber":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"language":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"finish":{"anyOf":[{"enum":["nonfoil","foil","etched"]},{"type":"null"}]},"rawFinish":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"resolvedPrintingId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"resolutionStatus":{"enum":["exact","manual","alias","ambiguous","unknown","conflict"]},"reason":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"manualChoice":{"anyOf":[{"type":"object","additionalProperties":false,"properties":{"selectedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},"printingId":{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},"reason":{"type":"string","pattern":"[\\s\\S]"}},"required":["selectedAt","printingId","reason"]},{"type":"null"}]}},"required":["deckId","sourceLineKey","sourcePrintingId","sourceScryfallId","name","quantity","section","categories","setCode","collectorNumber","language","finish","rawFinish","resolvedPrintingId","resolutionStatus","reason","manualChoice"]};

function validate30(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.deckId === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "deckId"},message:"must have required property '"+"deckId"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.sourceLineKey === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceLineKey"},message:"must have required property '"+"sourceLineKey"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.sourcePrintingId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourcePrintingId"},message:"must have required property '"+"sourcePrintingId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.sourceScryfallId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceScryfallId"},message:"must have required property '"+"sourceScryfallId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.name === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.quantity === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "quantity"},message:"must have required property '"+"quantity"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.section === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "section"},message:"must have required property '"+"section"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.categories === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "categories"},message:"must have required property '"+"categories"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.setCode === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "setCode"},message:"must have required property '"+"setCode"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.collectorNumber === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "collectorNumber"},message:"must have required property '"+"collectorNumber"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.language === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "language"},message:"must have required property '"+"language"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.finish === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "finish"},message:"must have required property '"+"finish"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data.rawFinish === undefined){
const err12 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rawFinish"},message:"must have required property '"+"rawFinish"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data.resolvedPrintingId === undefined){
const err13 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "resolvedPrintingId"},message:"must have required property '"+"resolvedPrintingId"+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data.resolutionStatus === undefined){
const err14 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "resolutionStatus"},message:"must have required property '"+"resolutionStatus"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data.reason === undefined){
const err15 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "reason"},message:"must have required property '"+"reason"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(data.manualChoice === undefined){
const err16 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "manualChoice"},message:"must have required property '"+"manualChoice"+"'"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema24.properties, key0))){
const err17 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.deckId !== undefined){
let data0 = data.deckId;
if(typeof data0 === "string"){
if(!pattern8.test(data0)){
const err18 = {instancePath:instancePath+"/deckId",schemaPath:"#/properties/deckId/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/deckId",schemaPath:"#/properties/deckId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.sourceLineKey !== undefined){
let data1 = data.sourceLineKey;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err20 = {instancePath:instancePath+"/sourceLineKey",schemaPath:"#/properties/sourceLineKey/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/sourceLineKey",schemaPath:"#/properties/sourceLineKey/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.sourcePrintingId !== undefined){
let data2 = data.sourcePrintingId;
const _errs7 = errors;
let valid1 = false;
const _errs8 = errors;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err22 = {instancePath:instancePath+"/sourcePrintingId",schemaPath:"#/properties/sourcePrintingId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/sourcePrintingId",schemaPath:"#/properties/sourcePrintingId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs10 = errors;
if(data2 !== null){
const err24 = {instancePath:instancePath+"/sourcePrintingId",schemaPath:"#/properties/sourcePrintingId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err25 = {instancePath:instancePath+"/sourcePrintingId",schemaPath:"#/properties/sourcePrintingId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
else {
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
}
}
if(data.sourceScryfallId !== undefined){
let data3 = data.sourceScryfallId;
const _errs13 = errors;
let valid2 = false;
const _errs14 = errors;
if(typeof data3 === "string"){
if(!pattern8.test(data3)){
const err26 = {instancePath:instancePath+"/sourceScryfallId",schemaPath:"#/properties/sourceScryfallId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/sourceScryfallId",schemaPath:"#/properties/sourceScryfallId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
var _valid1 = _errs14 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs16 = errors;
if(data3 !== null){
const err28 = {instancePath:instancePath+"/sourceScryfallId",schemaPath:"#/properties/sourceScryfallId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
var _valid1 = _errs16 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err29 = {instancePath:instancePath+"/sourceScryfallId",schemaPath:"#/properties/sourceScryfallId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
else {
errors = _errs13;
if(vErrors !== null){
if(_errs13){
vErrors.length = _errs13;
}
else {
vErrors = null;
}
}
}
}
if(data.name !== undefined){
let data4 = data.name;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err30 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
else {
const err31 = {instancePath:instancePath+"/name",schemaPath:"#/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.quantity !== undefined){
let data5 = data.quantity;
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err32 = {instancePath:instancePath+"/quantity",schemaPath:"#/properties/quantity/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 < 1 || isNaN(data5)){
const err33 = {instancePath:instancePath+"/quantity",schemaPath:"#/properties/quantity/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
}
if(data.section !== undefined){
let data6 = data.section;
if(typeof data6 === "string"){
if(!pattern0.test(data6)){
const err34 = {instancePath:instancePath+"/section",schemaPath:"#/properties/section/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/section",schemaPath:"#/properties/section/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data.categories !== undefined){
let data7 = data.categories;
if(Array.isArray(data7)){
const len0 = data7.length;
for(let i0=0; i0<len0; i0++){
let data8 = data7[i0];
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err36 = {instancePath:instancePath+"/categories/" + i0,schemaPath:"#/properties/categories/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
else {
const err37 = {instancePath:instancePath+"/categories/" + i0,schemaPath:"#/properties/categories/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
}
else {
const err38 = {instancePath:instancePath+"/categories",schemaPath:"#/properties/categories/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
if(data.setCode !== undefined){
let data9 = data.setCode;
const _errs29 = errors;
let valid5 = false;
const _errs30 = errors;
if(typeof data9 === "string"){
if(!pattern0.test(data9)){
const err39 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
else {
const err40 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
var _valid2 = _errs30 === errors;
valid5 = valid5 || _valid2;
if(!valid5){
const _errs32 = errors;
if(data9 !== null){
const err41 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
var _valid2 = _errs32 === errors;
valid5 = valid5 || _valid2;
}
if(!valid5){
const err42 = {instancePath:instancePath+"/setCode",schemaPath:"#/properties/setCode/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
else {
errors = _errs29;
if(vErrors !== null){
if(_errs29){
vErrors.length = _errs29;
}
else {
vErrors = null;
}
}
}
}
if(data.collectorNumber !== undefined){
let data10 = data.collectorNumber;
const _errs35 = errors;
let valid6 = false;
const _errs36 = errors;
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err43 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
else {
const err44 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
var _valid3 = _errs36 === errors;
valid6 = valid6 || _valid3;
if(!valid6){
const _errs38 = errors;
if(data10 !== null){
const err45 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
var _valid3 = _errs38 === errors;
valid6 = valid6 || _valid3;
}
if(!valid6){
const err46 = {instancePath:instancePath+"/collectorNumber",schemaPath:"#/properties/collectorNumber/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
else {
errors = _errs35;
if(vErrors !== null){
if(_errs35){
vErrors.length = _errs35;
}
else {
vErrors = null;
}
}
}
}
if(data.language !== undefined){
let data11 = data.language;
const _errs41 = errors;
let valid7 = false;
const _errs42 = errors;
if(typeof data11 === "string"){
if(!pattern0.test(data11)){
const err47 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
else {
const err48 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
var _valid4 = _errs42 === errors;
valid7 = valid7 || _valid4;
if(!valid7){
const _errs44 = errors;
if(data11 !== null){
const err49 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
var _valid4 = _errs44 === errors;
valid7 = valid7 || _valid4;
}
if(!valid7){
const err50 = {instancePath:instancePath+"/language",schemaPath:"#/properties/language/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
else {
errors = _errs41;
if(vErrors !== null){
if(_errs41){
vErrors.length = _errs41;
}
else {
vErrors = null;
}
}
}
}
if(data.finish !== undefined){
let data12 = data.finish;
const _errs47 = errors;
let valid8 = false;
const _errs48 = errors;
if(!(((data12 === "nonfoil") || (data12 === "foil")) || (data12 === "etched"))){
const err51 = {instancePath:instancePath+"/finish",schemaPath:"#/properties/finish/anyOf/0/enum",keyword:"enum",params:{allowedValues: schema24.properties.finish.anyOf[0].enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
var _valid5 = _errs48 === errors;
valid8 = valid8 || _valid5;
if(!valid8){
const _errs49 = errors;
if(data12 !== null){
const err52 = {instancePath:instancePath+"/finish",schemaPath:"#/properties/finish/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
var _valid5 = _errs49 === errors;
valid8 = valid8 || _valid5;
}
if(!valid8){
const err53 = {instancePath:instancePath+"/finish",schemaPath:"#/properties/finish/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
else {
errors = _errs47;
if(vErrors !== null){
if(_errs47){
vErrors.length = _errs47;
}
else {
vErrors = null;
}
}
}
}
if(data.rawFinish !== undefined){
let data13 = data.rawFinish;
const _errs52 = errors;
let valid9 = false;
const _errs53 = errors;
if(typeof data13 === "string"){
if(!pattern0.test(data13)){
const err54 = {instancePath:instancePath+"/rawFinish",schemaPath:"#/properties/rawFinish/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/rawFinish",schemaPath:"#/properties/rawFinish/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
var _valid6 = _errs53 === errors;
valid9 = valid9 || _valid6;
if(!valid9){
const _errs55 = errors;
if(data13 !== null){
const err56 = {instancePath:instancePath+"/rawFinish",schemaPath:"#/properties/rawFinish/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
var _valid6 = _errs55 === errors;
valid9 = valid9 || _valid6;
}
if(!valid9){
const err57 = {instancePath:instancePath+"/rawFinish",schemaPath:"#/properties/rawFinish/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
else {
errors = _errs52;
if(vErrors !== null){
if(_errs52){
vErrors.length = _errs52;
}
else {
vErrors = null;
}
}
}
}
if(data.resolvedPrintingId !== undefined){
let data14 = data.resolvedPrintingId;
const _errs58 = errors;
let valid10 = false;
const _errs59 = errors;
if(typeof data14 === "string"){
if(!pattern8.test(data14)){
const err58 = {instancePath:instancePath+"/resolvedPrintingId",schemaPath:"#/properties/resolvedPrintingId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
else {
const err59 = {instancePath:instancePath+"/resolvedPrintingId",schemaPath:"#/properties/resolvedPrintingId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
var _valid7 = _errs59 === errors;
valid10 = valid10 || _valid7;
if(!valid10){
const _errs61 = errors;
if(data14 !== null){
const err60 = {instancePath:instancePath+"/resolvedPrintingId",schemaPath:"#/properties/resolvedPrintingId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
var _valid7 = _errs61 === errors;
valid10 = valid10 || _valid7;
}
if(!valid10){
const err61 = {instancePath:instancePath+"/resolvedPrintingId",schemaPath:"#/properties/resolvedPrintingId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
else {
errors = _errs58;
if(vErrors !== null){
if(_errs58){
vErrors.length = _errs58;
}
else {
vErrors = null;
}
}
}
}
if(data.resolutionStatus !== undefined){
let data15 = data.resolutionStatus;
if(!((((((data15 === "exact") || (data15 === "manual")) || (data15 === "alias")) || (data15 === "ambiguous")) || (data15 === "unknown")) || (data15 === "conflict"))){
const err62 = {instancePath:instancePath+"/resolutionStatus",schemaPath:"#/properties/resolutionStatus/enum",keyword:"enum",params:{allowedValues: schema24.properties.resolutionStatus.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data.reason !== undefined){
let data16 = data.reason;
const _errs65 = errors;
let valid11 = false;
const _errs66 = errors;
if(typeof data16 === "string"){
if(!pattern0.test(data16)){
const err63 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
else {
const err64 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
var _valid8 = _errs66 === errors;
valid11 = valid11 || _valid8;
if(!valid11){
const _errs68 = errors;
if(data16 !== null){
const err65 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
var _valid8 = _errs68 === errors;
valid11 = valid11 || _valid8;
}
if(!valid11){
const err66 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
else {
errors = _errs65;
if(vErrors !== null){
if(_errs65){
vErrors.length = _errs65;
}
else {
vErrors = null;
}
}
}
}
if(data.manualChoice !== undefined){
let data17 = data.manualChoice;
const _errs71 = errors;
let valid12 = false;
const _errs72 = errors;
if(data17 && typeof data17 == "object" && !Array.isArray(data17)){
if(data17.selectedAt === undefined){
const err67 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/0/required",keyword:"required",params:{missingProperty: "selectedAt"},message:"must have required property '"+"selectedAt"+"'"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if(data17.printingId === undefined){
const err68 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/0/required",keyword:"required",params:{missingProperty: "printingId"},message:"must have required property '"+"printingId"+"'"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
if(data17.reason === undefined){
const err69 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/0/required",keyword:"required",params:{missingProperty: "reason"},message:"must have required property '"+"reason"+"'"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
for(const key1 in data17){
if(!(((key1 === "selectedAt") || (key1 === "printingId")) || (key1 === "reason"))){
const err70 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/0/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
if(data17.selectedAt !== undefined){
let data18 = data17.selectedAt;
if(typeof data18 === "string"){
if(!pattern3.test(data18)){
const err71 = {instancePath:instancePath+"/manualChoice/selectedAt",schemaPath:"#/properties/manualChoice/anyOf/0/properties/selectedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
else {
const err72 = {instancePath:instancePath+"/manualChoice/selectedAt",schemaPath:"#/properties/manualChoice/anyOf/0/properties/selectedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data17.printingId !== undefined){
let data19 = data17.printingId;
if(typeof data19 === "string"){
if(!pattern8.test(data19)){
const err73 = {instancePath:instancePath+"/manualChoice/printingId",schemaPath:"#/properties/manualChoice/anyOf/0/properties/printingId/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
else {
const err74 = {instancePath:instancePath+"/manualChoice/printingId",schemaPath:"#/properties/manualChoice/anyOf/0/properties/printingId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
if(data17.reason !== undefined){
let data20 = data17.reason;
if(typeof data20 === "string"){
if(!pattern0.test(data20)){
const err75 = {instancePath:instancePath+"/manualChoice/reason",schemaPath:"#/properties/manualChoice/anyOf/0/properties/reason/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
else {
const err76 = {instancePath:instancePath+"/manualChoice/reason",schemaPath:"#/properties/manualChoice/anyOf/0/properties/reason/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
else {
const err77 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/0/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
var _valid9 = _errs72 === errors;
valid12 = valid12 || _valid9;
if(!valid12){
const _errs81 = errors;
if(data17 !== null){
const err78 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
var _valid9 = _errs81 === errors;
valid12 = valid12 || _valid9;
}
if(!valid12){
const err79 = {instancePath:instancePath+"/manualChoice",schemaPath:"#/properties/manualChoice/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
else {
errors = _errs71;
if(vErrors !== null){
if(_errs71){
vErrors.length = _errs71;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err80 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
validate30.errors = vErrors;
return errors === 0;
}

export const validateMatchResult = validate31;
const schema25 = {"type":"object","additionalProperties":false,"properties":{"sourceLineKey":{"type":"string","pattern":"[\\s\\S]"},"eventId":{"type":"string","pattern":"[\\s\\S]"},"printingId":{"anyOf":[{"type":"string","pattern":"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},{"type":"null"}]},"artistKey":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]},"faceIndexes":{"type":"array","items":{"type":"integer","minimum":0}},"attendanceIds":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"dataVersion":{"type":"string","pattern":"[\\s\\S]"},"state":{"enum":["attending","no_listed_attendee","artist_unmapped","credit_missing","data_unavailable"]},"reason":{"anyOf":[{"type":"string","pattern":"[\\s\\S]"},{"type":"null"}]}},"required":["sourceLineKey","eventId","printingId","artistKey","faceIndexes","attendanceIds","dataVersion","state","reason"]};

function validate31(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.sourceLineKey === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceLineKey"},message:"must have required property '"+"sourceLineKey"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.eventId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventId"},message:"must have required property '"+"eventId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.printingId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "printingId"},message:"must have required property '"+"printingId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.artistKey === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "artistKey"},message:"must have required property '"+"artistKey"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.faceIndexes === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "faceIndexes"},message:"must have required property '"+"faceIndexes"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.attendanceIds === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "attendanceIds"},message:"must have required property '"+"attendanceIds"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.dataVersion === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "dataVersion"},message:"must have required property '"+"dataVersion"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.state === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.reason === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "reason"},message:"must have required property '"+"reason"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema25.properties, key0))){
const err9 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.sourceLineKey !== undefined){
let data0 = data.sourceLineKey;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err10 = {instancePath:instancePath+"/sourceLineKey",schemaPath:"#/properties/sourceLineKey/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/sourceLineKey",schemaPath:"#/properties/sourceLineKey/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.eventId !== undefined){
let data1 = data.eventId;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err12 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.printingId !== undefined){
let data2 = data.printingId;
const _errs7 = errors;
let valid1 = false;
const _errs8 = errors;
if(typeof data2 === "string"){
if(!pattern8.test(data2)){
const err14 = {instancePath:instancePath+"/printingId",schemaPath:"#/properties/printingId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/printingId",schemaPath:"#/properties/printingId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var _valid0 = _errs8 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs10 = errors;
if(data2 !== null){
const err16 = {instancePath:instancePath+"/printingId",schemaPath:"#/properties/printingId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err17 = {instancePath:instancePath+"/printingId",schemaPath:"#/properties/printingId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
else {
errors = _errs7;
if(vErrors !== null){
if(_errs7){
vErrors.length = _errs7;
}
else {
vErrors = null;
}
}
}
}
if(data.artistKey !== undefined){
let data3 = data.artistKey;
const _errs13 = errors;
let valid2 = false;
const _errs14 = errors;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err18 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
var _valid1 = _errs14 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs16 = errors;
if(data3 !== null){
const err20 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
var _valid1 = _errs16 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err21 = {instancePath:instancePath+"/artistKey",schemaPath:"#/properties/artistKey/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
else {
errors = _errs13;
if(vErrors !== null){
if(_errs13){
vErrors.length = _errs13;
}
else {
vErrors = null;
}
}
}
}
if(data.faceIndexes !== undefined){
let data4 = data.faceIndexes;
if(Array.isArray(data4)){
const len0 = data4.length;
for(let i0=0; i0<len0; i0++){
let data5 = data4[i0];
if(!(((typeof data5 == "number") && (!(data5 % 1) && !isNaN(data5))) && (isFinite(data5)))){
const err22 = {instancePath:instancePath+"/faceIndexes/" + i0,schemaPath:"#/properties/faceIndexes/items/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if((typeof data5 == "number") && (isFinite(data5))){
if(data5 < 0 || isNaN(data5)){
const err23 = {instancePath:instancePath+"/faceIndexes/" + i0,schemaPath:"#/properties/faceIndexes/items/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
}
else {
const err24 = {instancePath:instancePath+"/faceIndexes",schemaPath:"#/properties/faceIndexes/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data.attendanceIds !== undefined){
let data6 = data.attendanceIds;
if(Array.isArray(data6)){
const len1 = data6.length;
for(let i1=0; i1<len1; i1++){
let data7 = data6[i1];
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err25 = {instancePath:instancePath+"/attendanceIds/" + i1,schemaPath:"#/properties/attendanceIds/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/attendanceIds/" + i1,schemaPath:"#/properties/attendanceIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/attendanceIds",schemaPath:"#/properties/attendanceIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.dataVersion !== undefined){
let data8 = data.dataVersion;
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err28 = {instancePath:instancePath+"/dataVersion",schemaPath:"#/properties/dataVersion/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/dataVersion",schemaPath:"#/properties/dataVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data.state !== undefined){
let data9 = data.state;
if(!(((((data9 === "attending") || (data9 === "no_listed_attendee")) || (data9 === "artist_unmapped")) || (data9 === "credit_missing")) || (data9 === "data_unavailable"))){
const err30 = {instancePath:instancePath+"/state",schemaPath:"#/properties/state/enum",keyword:"enum",params:{allowedValues: schema25.properties.state.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.reason !== undefined){
let data10 = data.reason;
const _errs30 = errors;
let valid7 = false;
const _errs31 = errors;
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err31 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
else {
const err32 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
var _valid2 = _errs31 === errors;
valid7 = valid7 || _valid2;
if(!valid7){
const _errs33 = errors;
if(data10 !== null){
const err33 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
var _valid2 = _errs33 === errors;
valid7 = valid7 || _valid2;
}
if(!valid7){
const err34 = {instancePath:instancePath+"/reason",schemaPath:"#/properties/reason/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
else {
errors = _errs30;
if(vErrors !== null){
if(_errs30){
vErrors.length = _errs30;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err35 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
validate31.errors = vErrors;
return errors === 0;
}

export const validateEventDirectory = validate32;
const schema26 = {"type":"object","additionalProperties":false,"properties":{"event":{"$ref":"#/$defs/Event"},"attendance":{"type":"array","items":{"$ref":"#/$defs/Attendance"}},"mappings":{"type":"array","items":{"$ref":"#/$defs/ArtistMapping"}},"statistics":{"type":"array","items":{"$ref":"#/$defs/ArtistStatistics"}}},"required":["event","attendance","mappings","statistics"]};

function validate13(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.eventId === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventId"},message:"must have required property '"+"eventId"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.rawName === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rawName"},message:"must have required property '"+"rawName"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.guestId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "guestId"},message:"must have required property '"+"guestId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.mappingId === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mappingId"},message:"must have required property '"+"mappingId"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.profileUrl === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "profileUrl"},message:"must have required property '"+"profileUrl"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.portraitUrl === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "portraitUrl"},message:"must have required property '"+"portraitUrl"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.portraitAttribution === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "portraitAttribution"},message:"must have required property '"+"portraitAttribution"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.booth === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "booth"},message:"must have required property '"+"booth"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.days === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "days"},message:"must have required property '"+"days"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.status === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.sourceUrls === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceUrls"},message:"must have required property '"+"sourceUrls"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data.links === undefined){
const err12 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "links"},message:"must have required property '"+"links"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema19.properties, key0))){
const err13 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern0.test(data0)){
const err14 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/id",schemaPath:"#/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.eventId !== undefined){
let data1 = data.eventId;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err16 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/eventId",schemaPath:"#/properties/eventId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.rawName !== undefined){
let data2 = data.rawName;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err18 = {instancePath:instancePath+"/rawName",schemaPath:"#/properties/rawName/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/rawName",schemaPath:"#/properties/rawName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.guestId !== undefined){
let data3 = data.guestId;
const _errs9 = errors;
let valid1 = false;
const _errs10 = errors;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err20 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
var _valid0 = _errs10 === errors;
valid1 = valid1 || _valid0;
if(!valid1){
const _errs12 = errors;
if(data3 !== null){
const err22 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
var _valid0 = _errs12 === errors;
valid1 = valid1 || _valid0;
}
if(!valid1){
const err23 = {instancePath:instancePath+"/guestId",schemaPath:"#/properties/guestId/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
if(data.mappingId !== undefined){
let data4 = data.mappingId;
if(typeof data4 === "string"){
if(!pattern0.test(data4)){
const err24 = {instancePath:instancePath+"/mappingId",schemaPath:"#/properties/mappingId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/mappingId",schemaPath:"#/properties/mappingId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.profileUrl !== undefined){
let data5 = data.profileUrl;
if(typeof data5 === "string"){
if(!pattern2.test(data5)){
const err26 = {instancePath:instancePath+"/profileUrl",schemaPath:"#/properties/profileUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/profileUrl",schemaPath:"#/properties/profileUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.portraitUrl !== undefined){
let data6 = data.portraitUrl;
const _errs19 = errors;
let valid2 = false;
const _errs20 = errors;
if(typeof data6 === "string"){
if(!pattern2.test(data6)){
const err28 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
var _valid1 = _errs20 === errors;
valid2 = valid2 || _valid1;
if(!valid2){
const _errs22 = errors;
if(data6 !== null){
const err30 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
var _valid1 = _errs22 === errors;
valid2 = valid2 || _valid1;
}
if(!valid2){
const err31 = {instancePath:instancePath+"/portraitUrl",schemaPath:"#/properties/portraitUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
else {
errors = _errs19;
if(vErrors !== null){
if(_errs19){
vErrors.length = _errs19;
}
else {
vErrors = null;
}
}
}
}
if(data.portraitAttribution !== undefined){
let data7 = data.portraitAttribution;
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err32 = {instancePath:instancePath+"/portraitAttribution",schemaPath:"#/properties/portraitAttribution/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
else {
const err33 = {instancePath:instancePath+"/portraitAttribution",schemaPath:"#/properties/portraitAttribution/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
if(data.booth !== undefined){
let data8 = data.booth;
const _errs27 = errors;
let valid3 = false;
const _errs28 = errors;
if(typeof data8 === "string"){
if(!pattern0.test(data8)){
const err34 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
else {
const err35 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
var _valid2 = _errs28 === errors;
valid3 = valid3 || _valid2;
if(!valid3){
const _errs30 = errors;
if(data8 !== null){
const err36 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
var _valid2 = _errs30 === errors;
valid3 = valid3 || _valid2;
}
if(!valid3){
const err37 = {instancePath:instancePath+"/booth",schemaPath:"#/properties/booth/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
else {
errors = _errs27;
if(vErrors !== null){
if(_errs27){
vErrors.length = _errs27;
}
else {
vErrors = null;
}
}
}
}
if(data.days !== undefined){
let data9 = data.days;
if(Array.isArray(data9)){
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
let data10 = data9[i0];
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err38 = {instancePath:instancePath+"/days/" + i0,schemaPath:"#/properties/days/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
else {
const err39 = {instancePath:instancePath+"/days/" + i0,schemaPath:"#/properties/days/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
}
else {
const err40 = {instancePath:instancePath+"/days",schemaPath:"#/properties/days/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
if(data.status !== undefined){
let data11 = data.status;
if(!(((data11 === "listed") || (data11 === "cancelled")) || (data11 === "unknown"))){
const err41 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema19.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.sourceUrls !== undefined){
let data12 = data.sourceUrls;
if(Array.isArray(data12)){
const len1 = data12.length;
for(let i1=0; i1<len1; i1++){
let data13 = data12[i1];
if(typeof data13 === "string"){
if(!pattern2.test(data13)){
const err42 = {instancePath:instancePath+"/sourceUrls/" + i1,schemaPath:"#/properties/sourceUrls/items/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
else {
const err43 = {instancePath:instancePath+"/sourceUrls/" + i1,schemaPath:"#/properties/sourceUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
}
}
else {
const err44 = {instancePath:instancePath+"/sourceUrls",schemaPath:"#/properties/sourceUrls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data.links !== undefined){
let data14 = data.links;
if(Array.isArray(data14)){
const len2 = data14.length;
for(let i2=0; i2<len2; i2++){
let data15 = data14[i2];
if(data15 && typeof data15 == "object" && !Array.isArray(data15)){
if(data15.id === undefined){
const err45 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if(data15.type === undefined){
const err46 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
if(data15.platform === undefined){
const err47 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "platform"},message:"must have required property '"+"platform"+"'"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
if(data15.label === undefined){
const err48 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
if(data15.originalUrl === undefined){
const err49 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "originalUrl"},message:"must have required property '"+"originalUrl"+"'"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if(data15.displayUrl === undefined){
const err50 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "displayUrl"},message:"must have required property '"+"displayUrl"+"'"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
if(data15.sourceProfileUrl === undefined){
const err51 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "sourceProfileUrl"},message:"must have required property '"+"sourceProfileUrl"+"'"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
if(data15.retrievedAt === undefined){
const err52 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
for(const key1 in data15){
if(!((((((((key1 === "id") || (key1 === "type")) || (key1 === "platform")) || (key1 === "label")) || (key1 === "originalUrl")) || (key1 === "displayUrl")) || (key1 === "sourceProfileUrl")) || (key1 === "retrievedAt"))){
const err53 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data15.id !== undefined){
let data16 = data15.id;
if(typeof data16 === "string"){
if(!pattern0.test(data16)){
const err54 = {instancePath:instancePath+"/links/" + i2+"/id",schemaPath:"#/$defs/ArtistLink/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/links/" + i2+"/id",schemaPath:"#/$defs/ArtistLink/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
if(data15.type !== undefined){
let data17 = data15.type;
if(typeof data17 === "string"){
if(!pattern0.test(data17)){
const err56 = {instancePath:instancePath+"/links/" + i2+"/type",schemaPath:"#/$defs/ArtistLink/properties/type/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
else {
const err57 = {instancePath:instancePath+"/links/" + i2+"/type",schemaPath:"#/$defs/ArtistLink/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
if(data15.platform !== undefined){
let data18 = data15.platform;
const _errs52 = errors;
let valid12 = false;
const _errs53 = errors;
if(typeof data18 === "string"){
if(!pattern0.test(data18)){
const err58 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/0/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
else {
const err59 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
var _valid3 = _errs53 === errors;
valid12 = valid12 || _valid3;
if(!valid12){
const _errs55 = errors;
if(data18 !== null){
const err60 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
var _valid3 = _errs55 === errors;
valid12 = valid12 || _valid3;
}
if(!valid12){
const err61 = {instancePath:instancePath+"/links/" + i2+"/platform",schemaPath:"#/$defs/ArtistLink/properties/platform/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
else {
errors = _errs52;
if(vErrors !== null){
if(_errs52){
vErrors.length = _errs52;
}
else {
vErrors = null;
}
}
}
}
if(data15.label !== undefined){
let data19 = data15.label;
if(typeof data19 === "string"){
if(!pattern0.test(data19)){
const err62 = {instancePath:instancePath+"/links/" + i2+"/label",schemaPath:"#/$defs/ArtistLink/properties/label/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
else {
const err63 = {instancePath:instancePath+"/links/" + i2+"/label",schemaPath:"#/$defs/ArtistLink/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data15.originalUrl !== undefined){
let data20 = data15.originalUrl;
const _errs60 = errors;
let valid13 = false;
const _errs61 = errors;
if(typeof data20 !== "string"){
const err64 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
var _valid4 = _errs61 === errors;
valid13 = valid13 || _valid4;
if(!valid13){
const _errs63 = errors;
if(data20 !== null){
const err65 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
var _valid4 = _errs63 === errors;
valid13 = valid13 || _valid4;
}
if(!valid13){
const err66 = {instancePath:instancePath+"/links/" + i2+"/originalUrl",schemaPath:"#/$defs/ArtistLink/properties/originalUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
else {
errors = _errs60;
if(vErrors !== null){
if(_errs60){
vErrors.length = _errs60;
}
else {
vErrors = null;
}
}
}
}
if(data15.displayUrl !== undefined){
let data21 = data15.displayUrl;
const _errs66 = errors;
let valid14 = false;
const _errs67 = errors;
if(typeof data21 === "string"){
if(!pattern2.test(data21)){
const err67 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/0/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
else {
const err68 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/0/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
var _valid5 = _errs67 === errors;
valid14 = valid14 || _valid5;
if(!valid14){
const _errs69 = errors;
if(data21 !== null){
const err69 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
var _valid5 = _errs69 === errors;
valid14 = valid14 || _valid5;
}
if(!valid14){
const err70 = {instancePath:instancePath+"/links/" + i2+"/displayUrl",schemaPath:"#/$defs/ArtistLink/properties/displayUrl/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
else {
errors = _errs66;
if(vErrors !== null){
if(_errs66){
vErrors.length = _errs66;
}
else {
vErrors = null;
}
}
}
}
if(data15.sourceProfileUrl !== undefined){
let data22 = data15.sourceProfileUrl;
if(typeof data22 === "string"){
if(!pattern2.test(data22)){
const err71 = {instancePath:instancePath+"/links/" + i2+"/sourceProfileUrl",schemaPath:"#/$defs/ArtistLink/properties/sourceProfileUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
else {
const err72 = {instancePath:instancePath+"/links/" + i2+"/sourceProfileUrl",schemaPath:"#/$defs/ArtistLink/properties/sourceProfileUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
if(data15.retrievedAt !== undefined){
let data23 = data15.retrievedAt;
if(typeof data23 === "string"){
if(!pattern3.test(data23)){
const err73 = {instancePath:instancePath+"/links/" + i2+"/retrievedAt",schemaPath:"#/$defs/ArtistLink/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
else {
const err74 = {instancePath:instancePath+"/links/" + i2+"/retrievedAt",schemaPath:"#/$defs/ArtistLink/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
}
else {
const err75 = {instancePath:instancePath+"/links/" + i2,schemaPath:"#/$defs/ArtistLink/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
}
}
else {
const err76 = {instancePath:instancePath+"/links",schemaPath:"#/properties/links/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
}
}
else {
const err77 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
validate13.errors = vErrors;
return errors === 0;
}


function validate32(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.event === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "event"},message:"must have required property '"+"event"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.attendance === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "attendance"},message:"must have required property '"+"attendance"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.mappings === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mappings"},message:"must have required property '"+"mappings"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.statistics === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "statistics"},message:"must have required property '"+"statistics"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "event") || (key0 === "attendance")) || (key0 === "mappings")) || (key0 === "statistics"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.event !== undefined){
let data0 = data.event;
if(data0 && typeof data0 == "object" && !Array.isArray(data0)){
if(data0.id === undefined){
const err5 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data0.name === undefined){
const err6 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data0.startsAt === undefined){
const err7 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "startsAt"},message:"must have required property '"+"startsAt"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data0.endsAt === undefined){
const err8 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "endsAt"},message:"must have required property '"+"endsAt"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data0.location === undefined){
const err9 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "location"},message:"must have required property '"+"location"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data0.directoryUrl === undefined){
const err10 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "directoryUrl"},message:"must have required property '"+"directoryUrl"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data0.snapshotId === undefined){
const err11 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "snapshotId"},message:"must have required property '"+"snapshotId"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data0.retrievedAt === undefined){
const err12 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/required",keyword:"required",params:{missingProperty: "retrievedAt"},message:"must have required property '"+"retrievedAt"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
for(const key1 in data0){
if(!((((((((key1 === "id") || (key1 === "name")) || (key1 === "startsAt")) || (key1 === "endsAt")) || (key1 === "location")) || (key1 === "directoryUrl")) || (key1 === "snapshotId")) || (key1 === "retrievedAt"))){
const err13 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data0.id !== undefined){
let data1 = data0.id;
if(typeof data1 === "string"){
if(!pattern0.test(data1)){
const err14 = {instancePath:instancePath+"/event/id",schemaPath:"#/$defs/Event/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/event/id",schemaPath:"#/$defs/Event/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data0.name !== undefined){
let data2 = data0.name;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err16 = {instancePath:instancePath+"/event/name",schemaPath:"#/$defs/Event/properties/name/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/event/name",schemaPath:"#/$defs/Event/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data0.startsAt !== undefined){
let data3 = data0.startsAt;
if(typeof data3 === "string"){
if(!pattern43.test(data3)){
const err18 = {instancePath:instancePath+"/event/startsAt",schemaPath:"#/$defs/Event/properties/startsAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/event/startsAt",schemaPath:"#/$defs/Event/properties/startsAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data0.endsAt !== undefined){
let data4 = data0.endsAt;
if(typeof data4 === "string"){
if(!pattern43.test(data4)){
const err20 = {instancePath:instancePath+"/event/endsAt",schemaPath:"#/$defs/Event/properties/endsAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/event/endsAt",schemaPath:"#/$defs/Event/properties/endsAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data0.location !== undefined){
let data5 = data0.location;
if(typeof data5 === "string"){
if(!pattern0.test(data5)){
const err22 = {instancePath:instancePath+"/event/location",schemaPath:"#/$defs/Event/properties/location/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/event/location",schemaPath:"#/$defs/Event/properties/location/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data0.directoryUrl !== undefined){
let data6 = data0.directoryUrl;
if(typeof data6 === "string"){
if(!pattern2.test(data6)){
const err24 = {instancePath:instancePath+"/event/directoryUrl",schemaPath:"#/$defs/Event/properties/directoryUrl/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/event/directoryUrl",schemaPath:"#/$defs/Event/properties/directoryUrl/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data0.snapshotId !== undefined){
let data7 = data0.snapshotId;
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err26 = {instancePath:instancePath+"/event/snapshotId",schemaPath:"#/$defs/Event/properties/snapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/event/snapshotId",schemaPath:"#/$defs/Event/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data0.retrievedAt !== undefined){
let data8 = data0.retrievedAt;
if(typeof data8 === "string"){
if(!pattern3.test(data8)){
const err28 = {instancePath:instancePath+"/event/retrievedAt",schemaPath:"#/$defs/Event/properties/retrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
else {
const err29 = {instancePath:instancePath+"/event/retrievedAt",schemaPath:"#/$defs/Event/properties/retrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
}
else {
const err30 = {instancePath:instancePath+"/event",schemaPath:"#/$defs/Event/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.attendance !== undefined){
let data9 = data.attendance;
if(Array.isArray(data9)){
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
if(!(validate13(data9[i0], {instancePath:instancePath+"/attendance/" + i0,parentData:data9,parentDataProperty:i0,rootData}))){
vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
errors = vErrors.length;
}
}
}
else {
const err31 = {instancePath:instancePath+"/attendance",schemaPath:"#/properties/attendance/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.mappings !== undefined){
let data11 = data.mappings;
if(Array.isArray(data11)){
const len1 = data11.length;
for(let i1=0; i1<len1; i1++){
let data12 = data11[i1];
if(data12 && typeof data12 == "object" && !Array.isArray(data12)){
if(data12.id === undefined){
const err32 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data12.eventId === undefined){
const err33 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "eventId"},message:"must have required property '"+"eventId"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data12.attendanceId === undefined){
const err34 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "attendanceId"},message:"must have required property '"+"attendanceId"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data12.magicconNames === undefined){
const err35 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "magicconNames"},message:"must have required property '"+"magicconNames"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if(data12.artistKeys === undefined){
const err36 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "artistKeys"},message:"must have required property '"+"artistKeys"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(data12.sourceArtistIds === undefined){
const err37 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "sourceArtistIds"},message:"must have required property '"+"sourceArtistIds"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
if(data12.scryfallNames === undefined){
const err38 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "scryfallNames"},message:"must have required property '"+"scryfallNames"+"'"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
if(data12.status === undefined){
const err39 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if(data12.method === undefined){
const err40 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "method"},message:"must have required property '"+"method"+"'"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
if(data12.evidenceUrls === undefined){
const err41 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "evidenceUrls"},message:"must have required property '"+"evidenceUrls"+"'"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if(data12.reviewedAt === undefined){
const err42 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "reviewedAt"},message:"must have required property '"+"reviewedAt"+"'"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
if(data12.notes === undefined){
const err43 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/required",keyword:"required",params:{missingProperty: "notes"},message:"must have required property '"+"notes"+"'"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
for(const key2 in data12){
if(!(func2.call(schema17.properties, key2))){
const err44 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
if(data12.id !== undefined){
let data13 = data12.id;
if(typeof data13 === "string"){
if(!pattern0.test(data13)){
const err45 = {instancePath:instancePath+"/mappings/" + i1+"/id",schemaPath:"#/$defs/ArtistMapping/properties/id/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
}
else {
const err46 = {instancePath:instancePath+"/mappings/" + i1+"/id",schemaPath:"#/$defs/ArtistMapping/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
if(data12.eventId !== undefined){
let data14 = data12.eventId;
if(typeof data14 === "string"){
if(!pattern0.test(data14)){
const err47 = {instancePath:instancePath+"/mappings/" + i1+"/eventId",schemaPath:"#/$defs/ArtistMapping/properties/eventId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
}
else {
const err48 = {instancePath:instancePath+"/mappings/" + i1+"/eventId",schemaPath:"#/$defs/ArtistMapping/properties/eventId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
if(data12.attendanceId !== undefined){
let data15 = data12.attendanceId;
if(typeof data15 === "string"){
if(!pattern0.test(data15)){
const err49 = {instancePath:instancePath+"/mappings/" + i1+"/attendanceId",schemaPath:"#/$defs/ArtistMapping/properties/attendanceId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
}
else {
const err50 = {instancePath:instancePath+"/mappings/" + i1+"/attendanceId",schemaPath:"#/$defs/ArtistMapping/properties/attendanceId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
if(data12.magicconNames !== undefined){
let data16 = data12.magicconNames;
if(Array.isArray(data16)){
const len2 = data16.length;
for(let i2=0; i2<len2; i2++){
let data17 = data16[i2];
if(typeof data17 === "string"){
if(!pattern0.test(data17)){
const err51 = {instancePath:instancePath+"/mappings/" + i1+"/magicconNames/" + i2,schemaPath:"#/$defs/ArtistMapping/properties/magicconNames/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
else {
const err52 = {instancePath:instancePath+"/mappings/" + i1+"/magicconNames/" + i2,schemaPath:"#/$defs/ArtistMapping/properties/magicconNames/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
}
}
else {
const err53 = {instancePath:instancePath+"/mappings/" + i1+"/magicconNames",schemaPath:"#/$defs/ArtistMapping/properties/magicconNames/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
}
if(data12.artistKeys !== undefined){
let data18 = data12.artistKeys;
if(Array.isArray(data18)){
const len3 = data18.length;
for(let i3=0; i3<len3; i3++){
let data19 = data18[i3];
if(typeof data19 === "string"){
if(!pattern0.test(data19)){
const err54 = {instancePath:instancePath+"/mappings/" + i1+"/artistKeys/" + i3,schemaPath:"#/$defs/ArtistMapping/properties/artistKeys/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
else {
const err55 = {instancePath:instancePath+"/mappings/" + i1+"/artistKeys/" + i3,schemaPath:"#/$defs/ArtistMapping/properties/artistKeys/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
}
}
else {
const err56 = {instancePath:instancePath+"/mappings/" + i1+"/artistKeys",schemaPath:"#/$defs/ArtistMapping/properties/artistKeys/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
}
if(data12.sourceArtistIds !== undefined){
let data20 = data12.sourceArtistIds;
if(Array.isArray(data20)){
const len4 = data20.length;
for(let i4=0; i4<len4; i4++){
let data21 = data20[i4];
if(typeof data21 === "string"){
if(!pattern8.test(data21)){
const err57 = {instancePath:instancePath+"/mappings/" + i1+"/sourceArtistIds/" + i4,schemaPath:"#/$defs/ArtistMapping/properties/sourceArtistIds/items/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"},message:"must match pattern \""+"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"+"\""};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
}
else {
const err58 = {instancePath:instancePath+"/mappings/" + i1+"/sourceArtistIds/" + i4,schemaPath:"#/$defs/ArtistMapping/properties/sourceArtistIds/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
}
}
else {
const err59 = {instancePath:instancePath+"/mappings/" + i1+"/sourceArtistIds",schemaPath:"#/$defs/ArtistMapping/properties/sourceArtistIds/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
}
if(data12.scryfallNames !== undefined){
let data22 = data12.scryfallNames;
if(data22 && typeof data22 == "object" && !Array.isArray(data22)){
for(const key3 in data22){
let data23 = data22[key3];
if(Array.isArray(data23)){
const len5 = data23.length;
for(let i5=0; i5<len5; i5++){
let data24 = data23[i5];
if(typeof data24 === "string"){
if(!pattern0.test(data24)){
const err60 = {instancePath:instancePath+"/mappings/" + i1+"/scryfallNames/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i5,schemaPath:"#/$defs/ArtistMapping/properties/scryfallNames/additionalProperties/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
else {
const err61 = {instancePath:instancePath+"/mappings/" + i1+"/scryfallNames/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i5,schemaPath:"#/$defs/ArtistMapping/properties/scryfallNames/additionalProperties/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
}
else {
const err62 = {instancePath:instancePath+"/mappings/" + i1+"/scryfallNames/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/ArtistMapping/properties/scryfallNames/additionalProperties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
}
else {
const err63 = {instancePath:instancePath+"/mappings/" + i1+"/scryfallNames",schemaPath:"#/$defs/ArtistMapping/properties/scryfallNames/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
}
if(data12.status !== undefined){
let data25 = data12.status;
if(!(((data25 === "verified") || (data25 === "review_needed")) || (data25 === "unmatched"))){
const err64 = {instancePath:instancePath+"/mappings/" + i1+"/status",schemaPath:"#/$defs/ArtistMapping/properties/status/enum",keyword:"enum",params:{allowedValues: schema17.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
if(data12.method !== undefined){
let data26 = data12.method;
if(typeof data26 === "string"){
if(!pattern0.test(data26)){
const err65 = {instancePath:instancePath+"/mappings/" + i1+"/method",schemaPath:"#/$defs/ArtistMapping/properties/method/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
}
else {
const err66 = {instancePath:instancePath+"/mappings/" + i1+"/method",schemaPath:"#/$defs/ArtistMapping/properties/method/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
if(data12.evidenceUrls !== undefined){
let data27 = data12.evidenceUrls;
if(Array.isArray(data27)){
const len6 = data27.length;
for(let i6=0; i6<len6; i6++){
let data28 = data27[i6];
if(typeof data28 === "string"){
if(!pattern2.test(data28)){
const err67 = {instancePath:instancePath+"/mappings/" + i1+"/evidenceUrls/" + i6,schemaPath:"#/$defs/ArtistMapping/properties/evidenceUrls/items/pattern",keyword:"pattern",params:{pattern: "^[hH][tT][tT][pP][sS]?://[^\\s]+$"},message:"must match pattern \""+"^[hH][tT][tT][pP][sS]?://[^\\s]+$"+"\""};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
}
else {
const err68 = {instancePath:instancePath+"/mappings/" + i1+"/evidenceUrls/" + i6,schemaPath:"#/$defs/ArtistMapping/properties/evidenceUrls/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
}
else {
const err69 = {instancePath:instancePath+"/mappings/" + i1+"/evidenceUrls",schemaPath:"#/$defs/ArtistMapping/properties/evidenceUrls/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
if(data12.reviewedAt !== undefined){
let data29 = data12.reviewedAt;
if(typeof data29 === "string"){
if(!pattern43.test(data29)){
const err70 = {instancePath:instancePath+"/mappings/" + i1+"/reviewedAt",schemaPath:"#/$defs/ArtistMapping/properties/reviewedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}$"+"\""};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
else {
const err71 = {instancePath:instancePath+"/mappings/" + i1+"/reviewedAt",schemaPath:"#/$defs/ArtistMapping/properties/reviewedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
if(data12.notes !== undefined){
if(typeof data12.notes !== "string"){
const err72 = {instancePath:instancePath+"/mappings/" + i1+"/notes",schemaPath:"#/$defs/ArtistMapping/properties/notes/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
}
}
else {
const err73 = {instancePath:instancePath+"/mappings/" + i1,schemaPath:"#/$defs/ArtistMapping/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err73];
}
else {
vErrors.push(err73);
}
errors++;
}
}
}
else {
const err74 = {instancePath:instancePath+"/mappings",schemaPath:"#/properties/mappings/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err74];
}
else {
vErrors.push(err74);
}
errors++;
}
}
if(data.statistics !== undefined){
let data31 = data.statistics;
if(Array.isArray(data31)){
const len7 = data31.length;
for(let i7=0; i7<len7; i7++){
let data32 = data31[i7];
if(data32 && typeof data32 == "object" && !Array.isArray(data32)){
if(data32.artistKey === undefined){
const err75 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "artistKey"},message:"must have required property '"+"artistKey"+"'"};
if(vErrors === null){
vErrors = [err75];
}
else {
vErrors.push(err75);
}
errors++;
}
if(data32.snapshotId === undefined){
const err76 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "snapshotId"},message:"must have required property '"+"snapshotId"+"'"};
if(vErrors === null){
vErrors = [err76];
}
else {
vErrors.push(err76);
}
errors++;
}
if(data32.scope === undefined){
const err77 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "scope"},message:"must have required property '"+"scope"+"'"};
if(vErrors === null){
vErrors = [err77];
}
else {
vErrors.push(err77);
}
errors++;
}
if(data32.uniqueCards === undefined){
const err78 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "uniqueCards"},message:"must have required property '"+"uniqueCards"+"'"};
if(vErrors === null){
vErrors = [err78];
}
else {
vErrors.push(err78);
}
errors++;
}
if(data32.printingEditions === undefined){
const err79 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "printingEditions"},message:"must have required property '"+"printingEditions"+"'"};
if(vErrors === null){
vErrors = [err79];
}
else {
vErrors.push(err79);
}
errors++;
}
if(data32.languagePrintings === undefined){
const err80 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "languagePrintings"},message:"must have required property '"+"languagePrintings"+"'"};
if(vErrors === null){
vErrors = [err80];
}
else {
vErrors.push(err80);
}
errors++;
}
if(data32.uniqueArtworks === undefined){
const err81 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "uniqueArtworks"},message:"must have required property '"+"uniqueArtworks"+"'"};
if(vErrors === null){
vErrors = [err81];
}
else {
vErrors.push(err81);
}
errors++;
}
if(data32.supplementalObjects === undefined){
const err82 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "supplementalObjects"},message:"must have required property '"+"supplementalObjects"+"'"};
if(vErrors === null){
vErrors = [err82];
}
else {
vErrors.push(err82);
}
errors++;
}
if(data32.missingOracleIds === undefined){
const err83 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "missingOracleIds"},message:"must have required property '"+"missingOracleIds"+"'"};
if(vErrors === null){
vErrors = [err83];
}
else {
vErrors.push(err83);
}
errors++;
}
if(data32.missingIllustrations === undefined){
const err84 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/required",keyword:"required",params:{missingProperty: "missingIllustrations"},message:"must have required property '"+"missingIllustrations"+"'"};
if(vErrors === null){
vErrors = [err84];
}
else {
vErrors.push(err84);
}
errors++;
}
for(const key4 in data32){
if(!(func2.call(schema21.properties, key4))){
const err85 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err85];
}
else {
vErrors.push(err85);
}
errors++;
}
}
if(data32.artistKey !== undefined){
let data33 = data32.artistKey;
if(typeof data33 === "string"){
if(!pattern0.test(data33)){
const err86 = {instancePath:instancePath+"/statistics/" + i7+"/artistKey",schemaPath:"#/$defs/ArtistStatistics/properties/artistKey/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err86];
}
else {
vErrors.push(err86);
}
errors++;
}
}
else {
const err87 = {instancePath:instancePath+"/statistics/" + i7+"/artistKey",schemaPath:"#/$defs/ArtistStatistics/properties/artistKey/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err87];
}
else {
vErrors.push(err87);
}
errors++;
}
}
if(data32.snapshotId !== undefined){
let data34 = data32.snapshotId;
if(typeof data34 === "string"){
if(!pattern0.test(data34)){
const err88 = {instancePath:instancePath+"/statistics/" + i7+"/snapshotId",schemaPath:"#/$defs/ArtistStatistics/properties/snapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err88];
}
else {
vErrors.push(err88);
}
errors++;
}
}
else {
const err89 = {instancePath:instancePath+"/statistics/" + i7+"/snapshotId",schemaPath:"#/$defs/ArtistStatistics/properties/snapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err89];
}
else {
vErrors.push(err89);
}
errors++;
}
}
if(data32.scope !== undefined){
let data35 = data32.scope;
if(typeof data35 === "string"){
if(!pattern0.test(data35)){
const err90 = {instancePath:instancePath+"/statistics/" + i7+"/scope",schemaPath:"#/$defs/ArtistStatistics/properties/scope/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err90];
}
else {
vErrors.push(err90);
}
errors++;
}
}
else {
const err91 = {instancePath:instancePath+"/statistics/" + i7+"/scope",schemaPath:"#/$defs/ArtistStatistics/properties/scope/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err91];
}
else {
vErrors.push(err91);
}
errors++;
}
}
if(data32.uniqueCards !== undefined){
let data36 = data32.uniqueCards;
const _errs80 = errors;
let valid24 = false;
const _errs81 = errors;
if(!(((typeof data36 == "number") && (!(data36 % 1) && !isNaN(data36))) && (isFinite(data36)))){
const err92 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueCards",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueCards/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err92];
}
else {
vErrors.push(err92);
}
errors++;
}
if((typeof data36 == "number") && (isFinite(data36))){
if(data36 < 0 || isNaN(data36)){
const err93 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueCards",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueCards/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err93];
}
else {
vErrors.push(err93);
}
errors++;
}
}
var _valid0 = _errs81 === errors;
valid24 = valid24 || _valid0;
if(!valid24){
const _errs83 = errors;
if(data36 !== null){
const err94 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueCards",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueCards/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err94];
}
else {
vErrors.push(err94);
}
errors++;
}
var _valid0 = _errs83 === errors;
valid24 = valid24 || _valid0;
}
if(!valid24){
const err95 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueCards",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueCards/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err95];
}
else {
vErrors.push(err95);
}
errors++;
}
else {
errors = _errs80;
if(vErrors !== null){
if(_errs80){
vErrors.length = _errs80;
}
else {
vErrors = null;
}
}
}
}
if(data32.printingEditions !== undefined){
let data37 = data32.printingEditions;
const _errs86 = errors;
let valid25 = false;
const _errs87 = errors;
if(!(((typeof data37 == "number") && (!(data37 % 1) && !isNaN(data37))) && (isFinite(data37)))){
const err96 = {instancePath:instancePath+"/statistics/" + i7+"/printingEditions",schemaPath:"#/$defs/ArtistStatistics/properties/printingEditions/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err96];
}
else {
vErrors.push(err96);
}
errors++;
}
if((typeof data37 == "number") && (isFinite(data37))){
if(data37 < 0 || isNaN(data37)){
const err97 = {instancePath:instancePath+"/statistics/" + i7+"/printingEditions",schemaPath:"#/$defs/ArtistStatistics/properties/printingEditions/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err97];
}
else {
vErrors.push(err97);
}
errors++;
}
}
var _valid1 = _errs87 === errors;
valid25 = valid25 || _valid1;
if(!valid25){
const _errs89 = errors;
if(data37 !== null){
const err98 = {instancePath:instancePath+"/statistics/" + i7+"/printingEditions",schemaPath:"#/$defs/ArtistStatistics/properties/printingEditions/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err98];
}
else {
vErrors.push(err98);
}
errors++;
}
var _valid1 = _errs89 === errors;
valid25 = valid25 || _valid1;
}
if(!valid25){
const err99 = {instancePath:instancePath+"/statistics/" + i7+"/printingEditions",schemaPath:"#/$defs/ArtistStatistics/properties/printingEditions/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err99];
}
else {
vErrors.push(err99);
}
errors++;
}
else {
errors = _errs86;
if(vErrors !== null){
if(_errs86){
vErrors.length = _errs86;
}
else {
vErrors = null;
}
}
}
}
if(data32.languagePrintings !== undefined){
let data38 = data32.languagePrintings;
const _errs92 = errors;
let valid26 = false;
const _errs93 = errors;
if(!(((typeof data38 == "number") && (!(data38 % 1) && !isNaN(data38))) && (isFinite(data38)))){
const err100 = {instancePath:instancePath+"/statistics/" + i7+"/languagePrintings",schemaPath:"#/$defs/ArtistStatistics/properties/languagePrintings/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err100];
}
else {
vErrors.push(err100);
}
errors++;
}
if((typeof data38 == "number") && (isFinite(data38))){
if(data38 < 0 || isNaN(data38)){
const err101 = {instancePath:instancePath+"/statistics/" + i7+"/languagePrintings",schemaPath:"#/$defs/ArtistStatistics/properties/languagePrintings/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err101];
}
else {
vErrors.push(err101);
}
errors++;
}
}
var _valid2 = _errs93 === errors;
valid26 = valid26 || _valid2;
if(!valid26){
const _errs95 = errors;
if(data38 !== null){
const err102 = {instancePath:instancePath+"/statistics/" + i7+"/languagePrintings",schemaPath:"#/$defs/ArtistStatistics/properties/languagePrintings/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err102];
}
else {
vErrors.push(err102);
}
errors++;
}
var _valid2 = _errs95 === errors;
valid26 = valid26 || _valid2;
}
if(!valid26){
const err103 = {instancePath:instancePath+"/statistics/" + i7+"/languagePrintings",schemaPath:"#/$defs/ArtistStatistics/properties/languagePrintings/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err103];
}
else {
vErrors.push(err103);
}
errors++;
}
else {
errors = _errs92;
if(vErrors !== null){
if(_errs92){
vErrors.length = _errs92;
}
else {
vErrors = null;
}
}
}
}
if(data32.uniqueArtworks !== undefined){
let data39 = data32.uniqueArtworks;
const _errs98 = errors;
let valid27 = false;
const _errs99 = errors;
if(!(((typeof data39 == "number") && (!(data39 % 1) && !isNaN(data39))) && (isFinite(data39)))){
const err104 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueArtworks",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueArtworks/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err104];
}
else {
vErrors.push(err104);
}
errors++;
}
if((typeof data39 == "number") && (isFinite(data39))){
if(data39 < 0 || isNaN(data39)){
const err105 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueArtworks",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueArtworks/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err105];
}
else {
vErrors.push(err105);
}
errors++;
}
}
var _valid3 = _errs99 === errors;
valid27 = valid27 || _valid3;
if(!valid27){
const _errs101 = errors;
if(data39 !== null){
const err106 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueArtworks",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueArtworks/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err106];
}
else {
vErrors.push(err106);
}
errors++;
}
var _valid3 = _errs101 === errors;
valid27 = valid27 || _valid3;
}
if(!valid27){
const err107 = {instancePath:instancePath+"/statistics/" + i7+"/uniqueArtworks",schemaPath:"#/$defs/ArtistStatistics/properties/uniqueArtworks/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err107];
}
else {
vErrors.push(err107);
}
errors++;
}
else {
errors = _errs98;
if(vErrors !== null){
if(_errs98){
vErrors.length = _errs98;
}
else {
vErrors = null;
}
}
}
}
if(data32.supplementalObjects !== undefined){
let data40 = data32.supplementalObjects;
const _errs104 = errors;
let valid28 = false;
const _errs105 = errors;
if(!(((typeof data40 == "number") && (!(data40 % 1) && !isNaN(data40))) && (isFinite(data40)))){
const err108 = {instancePath:instancePath+"/statistics/" + i7+"/supplementalObjects",schemaPath:"#/$defs/ArtistStatistics/properties/supplementalObjects/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err108];
}
else {
vErrors.push(err108);
}
errors++;
}
if((typeof data40 == "number") && (isFinite(data40))){
if(data40 < 0 || isNaN(data40)){
const err109 = {instancePath:instancePath+"/statistics/" + i7+"/supplementalObjects",schemaPath:"#/$defs/ArtistStatistics/properties/supplementalObjects/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err109];
}
else {
vErrors.push(err109);
}
errors++;
}
}
var _valid4 = _errs105 === errors;
valid28 = valid28 || _valid4;
if(!valid28){
const _errs107 = errors;
if(data40 !== null){
const err110 = {instancePath:instancePath+"/statistics/" + i7+"/supplementalObjects",schemaPath:"#/$defs/ArtistStatistics/properties/supplementalObjects/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err110];
}
else {
vErrors.push(err110);
}
errors++;
}
var _valid4 = _errs107 === errors;
valid28 = valid28 || _valid4;
}
if(!valid28){
const err111 = {instancePath:instancePath+"/statistics/" + i7+"/supplementalObjects",schemaPath:"#/$defs/ArtistStatistics/properties/supplementalObjects/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err111];
}
else {
vErrors.push(err111);
}
errors++;
}
else {
errors = _errs104;
if(vErrors !== null){
if(_errs104){
vErrors.length = _errs104;
}
else {
vErrors = null;
}
}
}
}
if(data32.missingOracleIds !== undefined){
let data41 = data32.missingOracleIds;
const _errs110 = errors;
let valid29 = false;
const _errs111 = errors;
if(!(((typeof data41 == "number") && (!(data41 % 1) && !isNaN(data41))) && (isFinite(data41)))){
const err112 = {instancePath:instancePath+"/statistics/" + i7+"/missingOracleIds",schemaPath:"#/$defs/ArtistStatistics/properties/missingOracleIds/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err112];
}
else {
vErrors.push(err112);
}
errors++;
}
if((typeof data41 == "number") && (isFinite(data41))){
if(data41 < 0 || isNaN(data41)){
const err113 = {instancePath:instancePath+"/statistics/" + i7+"/missingOracleIds",schemaPath:"#/$defs/ArtistStatistics/properties/missingOracleIds/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err113];
}
else {
vErrors.push(err113);
}
errors++;
}
}
var _valid5 = _errs111 === errors;
valid29 = valid29 || _valid5;
if(!valid29){
const _errs113 = errors;
if(data41 !== null){
const err114 = {instancePath:instancePath+"/statistics/" + i7+"/missingOracleIds",schemaPath:"#/$defs/ArtistStatistics/properties/missingOracleIds/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err114];
}
else {
vErrors.push(err114);
}
errors++;
}
var _valid5 = _errs113 === errors;
valid29 = valid29 || _valid5;
}
if(!valid29){
const err115 = {instancePath:instancePath+"/statistics/" + i7+"/missingOracleIds",schemaPath:"#/$defs/ArtistStatistics/properties/missingOracleIds/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err115];
}
else {
vErrors.push(err115);
}
errors++;
}
else {
errors = _errs110;
if(vErrors !== null){
if(_errs110){
vErrors.length = _errs110;
}
else {
vErrors = null;
}
}
}
}
if(data32.missingIllustrations !== undefined){
let data42 = data32.missingIllustrations;
const _errs116 = errors;
let valid30 = false;
const _errs117 = errors;
if(!(((typeof data42 == "number") && (!(data42 % 1) && !isNaN(data42))) && (isFinite(data42)))){
const err116 = {instancePath:instancePath+"/statistics/" + i7+"/missingIllustrations",schemaPath:"#/$defs/ArtistStatistics/properties/missingIllustrations/anyOf/0/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err116];
}
else {
vErrors.push(err116);
}
errors++;
}
if((typeof data42 == "number") && (isFinite(data42))){
if(data42 < 0 || isNaN(data42)){
const err117 = {instancePath:instancePath+"/statistics/" + i7+"/missingIllustrations",schemaPath:"#/$defs/ArtistStatistics/properties/missingIllustrations/anyOf/0/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err117];
}
else {
vErrors.push(err117);
}
errors++;
}
}
var _valid6 = _errs117 === errors;
valid30 = valid30 || _valid6;
if(!valid30){
const _errs119 = errors;
if(data42 !== null){
const err118 = {instancePath:instancePath+"/statistics/" + i7+"/missingIllustrations",schemaPath:"#/$defs/ArtistStatistics/properties/missingIllustrations/anyOf/1/type",keyword:"type",params:{type: "null"},message:"must be null"};
if(vErrors === null){
vErrors = [err118];
}
else {
vErrors.push(err118);
}
errors++;
}
var _valid6 = _errs119 === errors;
valid30 = valid30 || _valid6;
}
if(!valid30){
const err119 = {instancePath:instancePath+"/statistics/" + i7+"/missingIllustrations",schemaPath:"#/$defs/ArtistStatistics/properties/missingIllustrations/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err119];
}
else {
vErrors.push(err119);
}
errors++;
}
else {
errors = _errs116;
if(vErrors !== null){
if(_errs116){
vErrors.length = _errs116;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err120 = {instancePath:instancePath+"/statistics/" + i7,schemaPath:"#/$defs/ArtistStatistics/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err120];
}
else {
vErrors.push(err120);
}
errors++;
}
}
}
else {
const err121 = {instancePath:instancePath+"/statistics",schemaPath:"#/properties/statistics/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err121];
}
else {
vErrors.push(err121);
}
errors++;
}
}
}
else {
const err122 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err122];
}
else {
vErrors.push(err122);
}
errors++;
}
validate32.errors = vErrors;
return errors === 0;
}

export const validateFileDescriptor = validate34;
const schema30 = {"type":"object","additionalProperties":false,"properties":{"sha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"bytes":{"type":"integer","minimum":0},"gzipBytes":{"type":"integer","minimum":0},"records":{"type":"integer","minimum":0},"kind":{"enum":["printings","tuples","artist-index","artists","event","sources"]}},"required":["sha256","bytes","gzipBytes","records","kind"]};

function validate34(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.sha256 === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.bytes === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bytes"},message:"must have required property '"+"bytes"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.gzipBytes === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "gzipBytes"},message:"must have required property '"+"gzipBytes"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.records === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "records"},message:"must have required property '"+"records"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.kind === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "sha256") || (key0 === "bytes")) || (key0 === "gzipBytes")) || (key0 === "records")) || (key0 === "kind"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.sha256 !== undefined){
let data0 = data.sha256;
if(typeof data0 === "string"){
if(!pattern5.test(data0)){
const err6 = {instancePath:instancePath+"/sha256",schemaPath:"#/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/sha256",schemaPath:"#/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.bytes !== undefined){
let data1 = data.bytes;
if(!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))){
const err8 = {instancePath:instancePath+"/bytes",schemaPath:"#/properties/bytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if((typeof data1 == "number") && (isFinite(data1))){
if(data1 < 0 || isNaN(data1)){
const err9 = {instancePath:instancePath+"/bytes",schemaPath:"#/properties/bytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
if(data.gzipBytes !== undefined){
let data2 = data.gzipBytes;
if(!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))){
const err10 = {instancePath:instancePath+"/gzipBytes",schemaPath:"#/properties/gzipBytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if((typeof data2 == "number") && (isFinite(data2))){
if(data2 < 0 || isNaN(data2)){
const err11 = {instancePath:instancePath+"/gzipBytes",schemaPath:"#/properties/gzipBytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
if(data.records !== undefined){
let data3 = data.records;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err12 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 < 0 || isNaN(data3)){
const err13 = {instancePath:instancePath+"/records",schemaPath:"#/properties/records/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
if(data.kind !== undefined){
let data4 = data.kind;
if(!((((((data4 === "printings") || (data4 === "tuples")) || (data4 === "artist-index")) || (data4 === "artists")) || (data4 === "event")) || (data4 === "sources"))){
const err14 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema30.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
validate34.errors = vErrors;
return errors === 0;
}

export const validateDataManifest = validate35;
const schema31 = {"type":"object","additionalProperties":false,"properties":{"schemaVersion":{"const":1},"version":{"type":"string","pattern":"^v1-[0-9a-f]{16}$"},"cardSnapshotId":{"type":"string","pattern":"[\\s\\S]"},"eventSnapshotId":{"type":"string","pattern":"[\\s\\S]"},"sourceUpdatedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},"eventRetrievedAt":{"type":"string","pattern":"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},"mappingRevision":{"type":"string","pattern":"[\\s\\S]"},"generatorVersion":{"type":"string","pattern":"[\\s\\S]"},"uuidPrefixLength":{"const":3},"printingColumns":{"type":"array","items":{"type":"string","pattern":"[\\s\\S]"}},"coverage":{"type":"object","additionalProperties":false,"properties":{"printings":{"type":"integer","minimum":0},"languages":{"type":"integer","minimum":0},"sets":{"type":"integer","minimum":0},"artists":{"type":"integer","minimum":0},"attendees":{"type":"integer","minimum":0},"faces":{"type":"integer","minimum":0}},"required":["printings","languages","sets","artists","attendees","faces"]},"files":{"type":"object","propertyNames":{"type":"string","pattern":"^(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.json$"},"additionalProperties":{"$ref":"#/$defs/FileDescriptor"}}},"required":["schemaVersion","version","cardSnapshotId","eventSnapshotId","sourceUpdatedAt","eventRetrievedAt","mappingRevision","generatorVersion","uuidPrefixLength","printingColumns","coverage","files"]};
const pattern134 = new RegExp("^v1-[0-9a-f]{16}$", "u");
const pattern142 = new RegExp("^(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.json$", "u");

function validate35(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.version === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "version"},message:"must have required property '"+"version"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.cardSnapshotId === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "cardSnapshotId"},message:"must have required property '"+"cardSnapshotId"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.eventSnapshotId === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventSnapshotId"},message:"must have required property '"+"eventSnapshotId"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.sourceUpdatedAt === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "sourceUpdatedAt"},message:"must have required property '"+"sourceUpdatedAt"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.eventRetrievedAt === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "eventRetrievedAt"},message:"must have required property '"+"eventRetrievedAt"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.mappingRevision === undefined){
const err6 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "mappingRevision"},message:"must have required property '"+"mappingRevision"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data.generatorVersion === undefined){
const err7 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "generatorVersion"},message:"must have required property '"+"generatorVersion"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data.uuidPrefixLength === undefined){
const err8 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "uuidPrefixLength"},message:"must have required property '"+"uuidPrefixLength"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data.printingColumns === undefined){
const err9 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "printingColumns"},message:"must have required property '"+"printingColumns"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data.coverage === undefined){
const err10 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "coverage"},message:"must have required property '"+"coverage"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data.files === undefined){
const err11 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "files"},message:"must have required property '"+"files"+"'"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
for(const key0 in data){
if(!(func2.call(schema31.properties, key0))){
const err12 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(1 !== data.schemaVersion){
const err13 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.version !== undefined){
let data1 = data.version;
if(typeof data1 === "string"){
if(!pattern134.test(data1)){
const err14 = {instancePath:instancePath+"/version",schemaPath:"#/properties/version/pattern",keyword:"pattern",params:{pattern: "^v1-[0-9a-f]{16}$"},message:"must match pattern \""+"^v1-[0-9a-f]{16}$"+"\""};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/version",schemaPath:"#/properties/version/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.cardSnapshotId !== undefined){
let data2 = data.cardSnapshotId;
if(typeof data2 === "string"){
if(!pattern0.test(data2)){
const err16 = {instancePath:instancePath+"/cardSnapshotId",schemaPath:"#/properties/cardSnapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/cardSnapshotId",schemaPath:"#/properties/cardSnapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.eventSnapshotId !== undefined){
let data3 = data.eventSnapshotId;
if(typeof data3 === "string"){
if(!pattern0.test(data3)){
const err18 = {instancePath:instancePath+"/eventSnapshotId",schemaPath:"#/properties/eventSnapshotId/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/eventSnapshotId",schemaPath:"#/properties/eventSnapshotId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.sourceUpdatedAt !== undefined){
let data4 = data.sourceUpdatedAt;
if(typeof data4 === "string"){
if(!pattern3.test(data4)){
const err20 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/sourceUpdatedAt",schemaPath:"#/properties/sourceUpdatedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.eventRetrievedAt !== undefined){
let data5 = data.eventRetrievedAt;
if(typeof data5 === "string"){
if(!pattern3.test(data5)){
const err22 = {instancePath:instancePath+"/eventRetrievedAt",schemaPath:"#/properties/eventRetrievedAt/pattern",keyword:"pattern",params:{pattern: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"},message:"must match pattern \""+"^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})$"+"\""};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/eventRetrievedAt",schemaPath:"#/properties/eventRetrievedAt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.mappingRevision !== undefined){
let data6 = data.mappingRevision;
if(typeof data6 === "string"){
if(!pattern0.test(data6)){
const err24 = {instancePath:instancePath+"/mappingRevision",schemaPath:"#/properties/mappingRevision/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/mappingRevision",schemaPath:"#/properties/mappingRevision/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.generatorVersion !== undefined){
let data7 = data.generatorVersion;
if(typeof data7 === "string"){
if(!pattern0.test(data7)){
const err26 = {instancePath:instancePath+"/generatorVersion",schemaPath:"#/properties/generatorVersion/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
else {
const err27 = {instancePath:instancePath+"/generatorVersion",schemaPath:"#/properties/generatorVersion/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
if(data.uuidPrefixLength !== undefined){
if(3 !== data.uuidPrefixLength){
const err28 = {instancePath:instancePath+"/uuidPrefixLength",schemaPath:"#/properties/uuidPrefixLength/const",keyword:"const",params:{allowedValue: 3},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.printingColumns !== undefined){
let data9 = data.printingColumns;
if(Array.isArray(data9)){
const len0 = data9.length;
for(let i0=0; i0<len0; i0++){
let data10 = data9[i0];
if(typeof data10 === "string"){
if(!pattern0.test(data10)){
const err29 = {instancePath:instancePath+"/printingColumns/" + i0,schemaPath:"#/properties/printingColumns/items/pattern",keyword:"pattern",params:{pattern: "[\\s\\S]"},message:"must match pattern \""+"[\\s\\S]"+"\""};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/printingColumns/" + i0,schemaPath:"#/properties/printingColumns/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
}
else {
const err31 = {instancePath:instancePath+"/printingColumns",schemaPath:"#/properties/printingColumns/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
if(data.coverage !== undefined){
let data11 = data.coverage;
if(data11 && typeof data11 == "object" && !Array.isArray(data11)){
if(data11.printings === undefined){
const err32 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "printings"},message:"must have required property '"+"printings"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data11.languages === undefined){
const err33 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "languages"},message:"must have required property '"+"languages"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data11.sets === undefined){
const err34 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "sets"},message:"must have required property '"+"sets"+"'"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
if(data11.artists === undefined){
const err35 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "artists"},message:"must have required property '"+"artists"+"'"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
if(data11.attendees === undefined){
const err36 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "attendees"},message:"must have required property '"+"attendees"+"'"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
if(data11.faces === undefined){
const err37 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/required",keyword:"required",params:{missingProperty: "faces"},message:"must have required property '"+"faces"+"'"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
for(const key1 in data11){
if(!((((((key1 === "printings") || (key1 === "languages")) || (key1 === "sets")) || (key1 === "artists")) || (key1 === "attendees")) || (key1 === "faces"))){
const err38 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
if(data11.printings !== undefined){
let data12 = data11.printings;
if(!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))){
const err39 = {instancePath:instancePath+"/coverage/printings",schemaPath:"#/properties/coverage/properties/printings/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
if((typeof data12 == "number") && (isFinite(data12))){
if(data12 < 0 || isNaN(data12)){
const err40 = {instancePath:instancePath+"/coverage/printings",schemaPath:"#/properties/coverage/properties/printings/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
}
if(data11.languages !== undefined){
let data13 = data11.languages;
if(!(((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13))) && (isFinite(data13)))){
const err41 = {instancePath:instancePath+"/coverage/languages",schemaPath:"#/properties/coverage/properties/languages/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
if((typeof data13 == "number") && (isFinite(data13))){
if(data13 < 0 || isNaN(data13)){
const err42 = {instancePath:instancePath+"/coverage/languages",schemaPath:"#/properties/coverage/properties/languages/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
}
if(data11.sets !== undefined){
let data14 = data11.sets;
if(!(((typeof data14 == "number") && (!(data14 % 1) && !isNaN(data14))) && (isFinite(data14)))){
const err43 = {instancePath:instancePath+"/coverage/sets",schemaPath:"#/properties/coverage/properties/sets/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
if((typeof data14 == "number") && (isFinite(data14))){
if(data14 < 0 || isNaN(data14)){
const err44 = {instancePath:instancePath+"/coverage/sets",schemaPath:"#/properties/coverage/properties/sets/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err44];
}
else {
vErrors.push(err44);
}
errors++;
}
}
}
if(data11.artists !== undefined){
let data15 = data11.artists;
if(!(((typeof data15 == "number") && (!(data15 % 1) && !isNaN(data15))) && (isFinite(data15)))){
const err45 = {instancePath:instancePath+"/coverage/artists",schemaPath:"#/properties/coverage/properties/artists/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err45];
}
else {
vErrors.push(err45);
}
errors++;
}
if((typeof data15 == "number") && (isFinite(data15))){
if(data15 < 0 || isNaN(data15)){
const err46 = {instancePath:instancePath+"/coverage/artists",schemaPath:"#/properties/coverage/properties/artists/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err46];
}
else {
vErrors.push(err46);
}
errors++;
}
}
}
if(data11.attendees !== undefined){
let data16 = data11.attendees;
if(!(((typeof data16 == "number") && (!(data16 % 1) && !isNaN(data16))) && (isFinite(data16)))){
const err47 = {instancePath:instancePath+"/coverage/attendees",schemaPath:"#/properties/coverage/properties/attendees/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err47];
}
else {
vErrors.push(err47);
}
errors++;
}
if((typeof data16 == "number") && (isFinite(data16))){
if(data16 < 0 || isNaN(data16)){
const err48 = {instancePath:instancePath+"/coverage/attendees",schemaPath:"#/properties/coverage/properties/attendees/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err48];
}
else {
vErrors.push(err48);
}
errors++;
}
}
}
if(data11.faces !== undefined){
let data17 = data11.faces;
if(!(((typeof data17 == "number") && (!(data17 % 1) && !isNaN(data17))) && (isFinite(data17)))){
const err49 = {instancePath:instancePath+"/coverage/faces",schemaPath:"#/properties/coverage/properties/faces/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err49];
}
else {
vErrors.push(err49);
}
errors++;
}
if((typeof data17 == "number") && (isFinite(data17))){
if(data17 < 0 || isNaN(data17)){
const err50 = {instancePath:instancePath+"/coverage/faces",schemaPath:"#/properties/coverage/properties/faces/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err50];
}
else {
vErrors.push(err50);
}
errors++;
}
}
}
}
else {
const err51 = {instancePath:instancePath+"/coverage",schemaPath:"#/properties/coverage/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err51];
}
else {
vErrors.push(err51);
}
errors++;
}
}
if(data.files !== undefined){
let data18 = data.files;
if(data18 && typeof data18 == "object" && !Array.isArray(data18)){
for(const key2 in data18){
const _errs39 = errors;
if(typeof key2 === "string"){
if(!pattern142.test(key2)){
const err52 = {instancePath:instancePath+"/files",schemaPath:"#/properties/files/propertyNames/pattern",keyword:"pattern",params:{pattern: "^(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.json$"},message:"must match pattern \""+"^(?:[a-z0-9_-]+/)*[a-z0-9_-]+\\.json$"+"\"",propertyName:key2};
if(vErrors === null){
vErrors = [err52];
}
else {
vErrors.push(err52);
}
errors++;
}
}
else {
const err53 = {instancePath:instancePath+"/files",schemaPath:"#/properties/files/propertyNames/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key2};
if(vErrors === null){
vErrors = [err53];
}
else {
vErrors.push(err53);
}
errors++;
}
var valid4 = _errs39 === errors;
if(!valid4){
const err54 = {instancePath:instancePath+"/files",schemaPath:"#/properties/files/propertyNames",keyword:"propertyNames",params:{propertyName: key2},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err54];
}
else {
vErrors.push(err54);
}
errors++;
}
}
for(const key3 in data18){
let data19 = data18[key3];
if(data19 && typeof data19 == "object" && !Array.isArray(data19)){
if(data19.sha256 === undefined){
const err55 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/required",keyword:"required",params:{missingProperty: "sha256"},message:"must have required property '"+"sha256"+"'"};
if(vErrors === null){
vErrors = [err55];
}
else {
vErrors.push(err55);
}
errors++;
}
if(data19.bytes === undefined){
const err56 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/required",keyword:"required",params:{missingProperty: "bytes"},message:"must have required property '"+"bytes"+"'"};
if(vErrors === null){
vErrors = [err56];
}
else {
vErrors.push(err56);
}
errors++;
}
if(data19.gzipBytes === undefined){
const err57 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/required",keyword:"required",params:{missingProperty: "gzipBytes"},message:"must have required property '"+"gzipBytes"+"'"};
if(vErrors === null){
vErrors = [err57];
}
else {
vErrors.push(err57);
}
errors++;
}
if(data19.records === undefined){
const err58 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/required",keyword:"required",params:{missingProperty: "records"},message:"must have required property '"+"records"+"'"};
if(vErrors === null){
vErrors = [err58];
}
else {
vErrors.push(err58);
}
errors++;
}
if(data19.kind === undefined){
const err59 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err59];
}
else {
vErrors.push(err59);
}
errors++;
}
for(const key4 in data19){
if(!(((((key4 === "sha256") || (key4 === "bytes")) || (key4 === "gzipBytes")) || (key4 === "records")) || (key4 === "kind"))){
const err60 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key4},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err60];
}
else {
vErrors.push(err60);
}
errors++;
}
}
if(data19.sha256 !== undefined){
let data20 = data19.sha256;
if(typeof data20 === "string"){
if(!pattern5.test(data20)){
const err61 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/sha256",schemaPath:"#/$defs/FileDescriptor/properties/sha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err61];
}
else {
vErrors.push(err61);
}
errors++;
}
}
else {
const err62 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/sha256",schemaPath:"#/$defs/FileDescriptor/properties/sha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err62];
}
else {
vErrors.push(err62);
}
errors++;
}
}
if(data19.bytes !== undefined){
let data21 = data19.bytes;
if(!(((typeof data21 == "number") && (!(data21 % 1) && !isNaN(data21))) && (isFinite(data21)))){
const err63 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/bytes",schemaPath:"#/$defs/FileDescriptor/properties/bytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err63];
}
else {
vErrors.push(err63);
}
errors++;
}
if((typeof data21 == "number") && (isFinite(data21))){
if(data21 < 0 || isNaN(data21)){
const err64 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/bytes",schemaPath:"#/$defs/FileDescriptor/properties/bytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err64];
}
else {
vErrors.push(err64);
}
errors++;
}
}
}
if(data19.gzipBytes !== undefined){
let data22 = data19.gzipBytes;
if(!(((typeof data22 == "number") && (!(data22 % 1) && !isNaN(data22))) && (isFinite(data22)))){
const err65 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/gzipBytes",schemaPath:"#/$defs/FileDescriptor/properties/gzipBytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err65];
}
else {
vErrors.push(err65);
}
errors++;
}
if((typeof data22 == "number") && (isFinite(data22))){
if(data22 < 0 || isNaN(data22)){
const err66 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/gzipBytes",schemaPath:"#/$defs/FileDescriptor/properties/gzipBytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err66];
}
else {
vErrors.push(err66);
}
errors++;
}
}
}
if(data19.records !== undefined){
let data23 = data19.records;
if(!(((typeof data23 == "number") && (!(data23 % 1) && !isNaN(data23))) && (isFinite(data23)))){
const err67 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/records",schemaPath:"#/$defs/FileDescriptor/properties/records/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err67];
}
else {
vErrors.push(err67);
}
errors++;
}
if((typeof data23 == "number") && (isFinite(data23))){
if(data23 < 0 || isNaN(data23)){
const err68 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/records",schemaPath:"#/$defs/FileDescriptor/properties/records/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err68];
}
else {
vErrors.push(err68);
}
errors++;
}
}
}
if(data19.kind !== undefined){
let data24 = data19.kind;
if(!((((((data24 === "printings") || (data24 === "tuples")) || (data24 === "artist-index")) || (data24 === "artists")) || (data24 === "event")) || (data24 === "sources"))){
const err69 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/kind",schemaPath:"#/$defs/FileDescriptor/properties/kind/enum",keyword:"enum",params:{allowedValues: schema30.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err69];
}
else {
vErrors.push(err69);
}
errors++;
}
}
}
else {
const err70 = {instancePath:instancePath+"/files/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/FileDescriptor/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err70];
}
else {
vErrors.push(err70);
}
errors++;
}
}
}
else {
const err71 = {instancePath:instancePath+"/files",schemaPath:"#/properties/files/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err71];
}
else {
vErrors.push(err71);
}
errors++;
}
}
}
else {
const err72 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err72];
}
else {
vErrors.push(err72);
}
errors++;
}
validate35.errors = vErrors;
return errors === 0;
}

export const validateActiveManifest = validate36;
const schema33 = {"type":"object","additionalProperties":false,"properties":{"schemaVersion":{"const":1},"version":{"type":"string","pattern":"^v1-[0-9a-f]{16}$"},"manifestSha256":{"type":"string","pattern":"^[0-9a-f]{64}$"},"manifestBytes":{"type":"integer","minimum":1,"maximum":4194304}},"required":["schemaVersion","version","manifestSha256","manifestBytes"]};

function validate36(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}){
let vErrors = null;
let errors = 0;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.schemaVersion === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "schemaVersion"},message:"must have required property '"+"schemaVersion"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.version === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "version"},message:"must have required property '"+"version"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.manifestSha256 === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "manifestSha256"},message:"must have required property '"+"manifestSha256"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.manifestBytes === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "manifestBytes"},message:"must have required property '"+"manifestBytes"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "schemaVersion") || (key0 === "version")) || (key0 === "manifestSha256")) || (key0 === "manifestBytes"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.schemaVersion !== undefined){
if(1 !== data.schemaVersion){
const err5 = {instancePath:instancePath+"/schemaVersion",schemaPath:"#/properties/schemaVersion/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.version !== undefined){
let data1 = data.version;
if(typeof data1 === "string"){
if(!pattern134.test(data1)){
const err6 = {instancePath:instancePath+"/version",schemaPath:"#/properties/version/pattern",keyword:"pattern",params:{pattern: "^v1-[0-9a-f]{16}$"},message:"must match pattern \""+"^v1-[0-9a-f]{16}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/version",schemaPath:"#/properties/version/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.manifestSha256 !== undefined){
let data2 = data.manifestSha256;
if(typeof data2 === "string"){
if(!pattern5.test(data2)){
const err8 = {instancePath:instancePath+"/manifestSha256",schemaPath:"#/properties/manifestSha256/pattern",keyword:"pattern",params:{pattern: "^[0-9a-f]{64}$"},message:"must match pattern \""+"^[0-9a-f]{64}$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/manifestSha256",schemaPath:"#/properties/manifestSha256/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.manifestBytes !== undefined){
let data3 = data.manifestBytes;
if(!(((typeof data3 == "number") && (!(data3 % 1) && !isNaN(data3))) && (isFinite(data3)))){
const err10 = {instancePath:instancePath+"/manifestBytes",schemaPath:"#/properties/manifestBytes/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if((typeof data3 == "number") && (isFinite(data3))){
if(data3 > 4194304 || isNaN(data3)){
const err11 = {instancePath:instancePath+"/manifestBytes",schemaPath:"#/properties/manifestBytes/maximum",keyword:"maximum",params:{comparison: "<=", limit: 4194304},message:"must be <= 4194304"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(data3 < 1 || isNaN(data3)){
const err12 = {instancePath:instancePath+"/manifestBytes",schemaPath:"#/properties/manifestBytes/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
}
else {
const err13 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
validate36.errors = vErrors;
return errors === 0;
}

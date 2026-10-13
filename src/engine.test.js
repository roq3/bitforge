import test from 'node:test';
import assert from 'node:assert/strict';
import {parseValue,signed,bytes,floatValue,floatBits,fixed,operate,addressParts} from './engine.js';
test('integer boundaries and exact 64-bit precision',()=>{
 assert.equal(parseValue('18446744073709551615',10,64),0xffffffffffffffffn);
 assert.equal(parseValue('-2147483648',10,32),0x80000000n);
 assert.equal(signed(0xffffffffn,32),-1n);
 for(const s of ['4294967296','-2147483649','1.2','']) assert.throws(()=>parseValue(s,10,32));
 assert.equal(parseValue('0b1111_0000',2,8),240n);
 assert.throws(()=>parseValue('0xGG',16,32));
});
test('byte order and bounded bit operations',()=>{
 assert.equal(bytes(0xdeadbeefn,32,true),'EF BE AD DE');
 assert.equal(operate(0xdeadbeefn,32,'swap'),0xefbeadden);
 assert.equal(operate(0x80n,8,'sar'),0xc0n);
 assert.equal(operate(0x80n,8,'shr'),0x40n);
 assert.equal(operate(0x80n,8,'rol'),1n);
 assert.equal(operate(1n,8,'ror'),0x80n);
 assert.equal(operate(0x81n,8,'rol',8),0x81n);
 assert.equal(operate(1n,8,'neg'),255n);
 assert.equal(operate(255n,8,'shl',8),0n);
});
test('IEEE 754 reinterpretation, signed zero, infinity and NaN',()=>{
 assert.equal(floatValue(0x3f800000n,32),1);
 assert.equal(floatBits('1',64),0x3ff0000000000000n);
 assert(Object.is(floatValue(floatBits('-0',32),32),-0));
 assert.equal(floatValue(floatBits('Infinity',64),64),Infinity);
 assert(Number.isNaN(floatValue(floatBits('NaN',32),32)));
 assert.throws(()=>floatBits('invalid',32));
 assert.throws(()=>floatBits('1',16));
});
test('exact fixed point and TriCore signed address carry',()=>{
 assert.equal(fixed(0x8000n,16,15),'-1');
 assert.equal(fixed(1n,64,63),'0.000000000000000000108420217248550443400745280086994171142578125');
 for(const address of [0xdeadbeefn,0x8000n,0xffff8000n,0xffffffffn,0x7fffn]){
 const {high,low}=addressParts(address);
 assert.equal(((high<<16n)+low)&0xffffffffn,address);
 }
});

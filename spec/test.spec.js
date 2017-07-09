const parser = require('../src/parser');


describe('parser', function() {
    function testOpcode(opcode, bytes) {
        const result = parser.parse(opcode);
        expect(result[0].bytes).toEqual(bytes);
    }

    it('should parse empty file', function() {
        const result = parser.parse(``)
        expect(result).toBeNull();
    });
    it('should parse whitespace only', function() {
        const result = parser.parse(`      
        `)
        expect(result).toBeNull();
    });
    it('should parse nop', function() {
        const result = parser.parse('nop');
        expect(result).toEqual([{
            text: 'nop',
            bytes: [0]
        }]);
    });
    it('should parse nop with whitespace', function() {
        const result = parser.parse('  nop   ');
        expect(result).toEqual([{
            text: 'nop',
            bytes: [0]
        }]);
    });
    it('should parse nop with label', function() {
        const result = parser.parse('thing:  nop   ');
        expect(result).toEqual([{
            text: 'nop',
            bytes: [0],
            label: 'thing'
        }]);
    });
    it('should parse nop with comment, followed by nop', function() {
        const result = parser.parse(`thing:  nop  ; lovely stuff
        nop`);
        expect(result).toEqual([{
            text: 'nop',
            bytes: [0],
            label: 'thing'
        }, {
            text: 'nop',
            bytes: [0],
        }]);
    });
    it('should parse nop with comment, followed by eof', function() {
        const result = parser.parse(`thing:  nop  ; lovely stuff`);
        expect(result).toEqual([{
            text: 'nop',
            bytes: [0],
            label: 'thing'
        }]);
        // console.log(JSON.stringify(result));
    });

    const opcodes = [
        ['nop', [0x00]],
        ['ld bc,$12 + $34 + $2', [0x01, 0x48, 0x00]],
        ['ld bc,$12 + start', [0x01, {
            expression: '18 + start'
        }, null]],
        ['ld bc,$1234', [0x01, 0x34, 0x12]],
        ['ld (bc),a', [0x02]],
        ['inc bc', [0x03]],
        ['inc b', [0x04]],
        ['dec b', [0x05]],
        ['ld b,$12', [0x06, 0x12]],
        ['rlca', [0x07]],
        ['ex af,af\'', [0x08]],
        ['add hl,bc', [0x09]],
        ['ld a,(bc)', [0x0a]],
        ['dec bc', [0x0b]],
        ['inc c', [0x0c]],
        ['dec c', [0x0d]],
        ['ld c,$12', [0x0e, 0x12]],
        ['rrca', [0x0f]],
        ['djnz $100', [0x10, {
            relative: 256
        }]],
        ['ld de,$543F', [0x11, 0x3f, 0x54]],
        ['ld (de),a', [0x12]],
        ['inc de', [0x13]],
        ['inc d', [0x14]],
        ['dec d', [0x15]],
        ['ld d,$fe', [0x16, 0xfe]],
        ['rla', [0x17]],
        ['jr $100', [0x18, {
            relative: 256
        }]],
        ['add hl,de', [0x19]],
        ['ld a,(de)', [0x1a]],
        ['dec de', [0x1b]],
        ['inc e', [0x1c]],
        ['dec e', [0x1d]],
        ['ld e,$01', [0x1e, 0x01]],
        ['rra', [0x1f]],
        ['jr nz,$100', [0x20, {
            relative: 256
        }]],
        ['ld hl,$e0f9', [0x21, 0xf9, 0xe0]],
        ['ld ($1234),hl', [0x22, 0x34, 0x12]],
        ['inc hl', [0x23]],
        ['inc h', [0x24]],
        ['dec h', [0x25]],
        ['ld h,$9a', [0x26, 0x9a]],
        ['daa', [0x27]],
        ['jr z,$100', [0x28, {
            relative: 256
        }]],
        ['add hl,hl', [0x29]],
        ['ld hl,($7Bca)', [0x2a, 0xca, 0x7b]],
        ['dec hl', [0x2b]],
        ['inc l', [0x2c]],
        ['dec l', [0x2d]],
        ['ld l,$42', [0x2e, 0x42]],
        ['cpl', [0x2f]],
        ['jr nc,$100', [0x30, {
            relative: 256
        }]],
        ['ld sp,$e0f9', [0x31, 0xf9, 0xe0]],
        ['ld ($1234),a', [0x32, 0x34, 0x12]],
        ['inc sp', [0x33]],
        ['inc (hl)', [0x34]],
        ['dec (hl)', [0x35]],
        ['ld (hl),$9a', [0x36, 0x9a]],
        ['scf', [0x37]],
        ['jr c,$100', [0x38, {
            relative: 256
        }]],
        ['add hl,sp', [0x39]],
        ['ld a,($7Bca)', [0x3a, 0xca, 0x7b]],
        ['dec sp', [0x3b]],
        ['inc a', [0x3c]],
        ['dec a', [0x3d]],
        ['ld a,$42', [0x3e, 0x42]],
        ['ccf', [0x3f]],

        ['ld b,b', [0x40]],
        ['ld b,c', [0x41]],
        ['ld b,d', [0x42]],
        ['ld b,e', [0x43]],
        ['ld b,h', [0x44]],
        ['ld b,l', [0x45]],
        ['ld b,(hl)', [0x46]],
        ['ld b,a', [0x47]],

        ['ld c,b', [0x48]],
        ['ld c,c', [0x49]],
        ['ld c,d', [0x4a]],
        ['ld c,e', [0x4b]],
        ['ld c,h', [0x4c]],
        ['ld c,l', [0x4d]],
        ['ld c,(hl)', [0x4e]],
        ['ld c,a', [0x4f]],

        ['ld d,b', [0x50]],
        ['ld d,c', [0x51]],
        ['ld d,d', [0x52]],
        ['ld d,e', [0x53]],
        ['ld d,h', [0x54]],
        ['ld d,l', [0x55]],
        ['ld d,(hl)', [0x56]],
        ['ld d,a', [0x57]],

        ['ld e,b', [0x58]],
        ['ld e,c', [0x59]],
        ['ld e,d', [0x5a]],
        ['ld e,e', [0x5b]],
        ['ld e,h', [0x5c]],
        ['ld e,l', [0x5d]],
        ['ld e,(hl)', [0x5e]],
        ['ld e,a', [0x5f]],

        ['ld h,b', [0x60]],
        ['ld h,c', [0x61]],
        ['ld h,d', [0x62]],
        ['ld h,e', [0x63]],
        ['ld h,h', [0x64]],
        ['ld h,l', [0x65]],
        ['ld h,(hl)', [0x66]],
        ['ld h,a', [0x67]],

        ['ld l,b', [0x68]],
        ['ld l,c', [0x69]],
        ['ld l,d', [0x6a]],
        ['ld l,e', [0x6b]],
        ['ld l,h', [0x6c]],
        ['ld l,l', [0x6d]],
        ['ld l,(hl)', [0x6e]],
        ['ld l,a', [0x6f]],

        ['ld (hl),b', [0x70]],
        ['ld (hl),c', [0x71]],
        ['ld (hl),d', [0x72]],
        ['ld (hl),e', [0x73]],
        ['ld (hl),h', [0x74]],
        ['ld (hl),l', [0x75]],
        ['halt', [0x76]],
        ['ld (hl),a', [0x77]],

        ['ld a,b', [0x78]],
        ['ld a,c', [0x79]],
        ['ld a,d', [0x7a]],
        ['ld a,e', [0x7b]],
        ['ld a,h', [0x7c]],
        ['ld a,l', [0x7d]],
        ['ld a,(hl)', [0x7e]],
        ['ld a,a', [0x7f]],
    ]
    for (const opcode of opcodes) {
        it('should parse ' + opcode[0], function() {;
            const result = parser.parse(opcode[0]);
            expect(result[0].bytes).toEqual(opcode[1]);
        });
    }

    it('should not parse ld (hl),(hl)', function() {
        expect(function() {
            const result = parser.parse('ld (hl),(hl)');
        }).toThrow();
    })
});
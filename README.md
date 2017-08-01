maz
===

Macro Assembler for Z80
-----------------------

Maz is a Z80 macro assembler, which is currently under development. I wouldn't advise using it until it's at version 1, or at least until I change this message.

Numbers
-------

Numbers are decimal unless one of the following applies:

* Numbers which start with $ or end with h are in hex
* Numbers which end with o are in octal
* Numbers which start with % or end with b are in binary

Numbers can have _ in them to improve readability: eg: 1101_0100_1010_1111b

Strings
-------

Source files are expected to be encoded in UTF-8, and so all strings are processed as UTF-8 strings. Characters in the range 00-7F are the same as ASCII characters. Example:

    68           db "h"
    c3 9f        db "ß"
    e2 84 a2     db "™"
    f0 9f 98 81  db "😁"

Labels
------

Labels contains any of the following: a-z, A-Z, 0-9, _

$ can be used to refer to the address of the current statement. In the case of DBs, it refers to the address of the start of the DBs.

When defining a label in a block, you can prefix it with an at symbol (@) to make it public. This makes it get declared at the top level instead of in the block's scope.

Macros may have the same name as a label.

Addresses
---------

When assembling the code, there are two addresses which are tracked: the output address, and the code address. The output address defines where the generated bytes go in memory and in the output file. The code address initially is the same as the output address, but it is possible to change this using the PHASE directive. When this happens then the code is assembled as if it were to go in memory at the code address, but it still get places at the output address. This is useful if the assembled code is going to get copied to a different location before execution. The output and code addresses both start at 0 until set by ORG or PHASE.

Some example code, including the output on the left (output address, followed by bytes). Notice how the second jump instruction jumps to $200, despite the fact that the 'two' label is output at location $105.

                      .org $100
    0100 3e01         one:   ld a,1
    0102 c30001              jp one
                      .phase $200
    0105 3e01         two:   ld a,1
    0107 c30002              jp two


Directives
----------

Any directive shown below without a leading full stop (period) may also be written with a leading full stop. The full stop is not optional if it is shown.

<dl>
<dt>db <i>bytes</i></dt>
<dt>defb <i>bytes</i></dt>
<dd>Declare bytes. Strings are converted into their ASCII values.

    db 0,1,100,$12,"hello\n"
</dd>
<dt>ds <i>expression</i></dt>
<dt>defs <i>expression</i></dt>
<dd>Declare storage. The expression is the number of bytes of storage to reserve. The bytes will be initialised to zeroes.

    ds 12
</dd>
<dt>equ <i>expression</i></dt>
<dd>Sets the value of a label. This must be prefixed with a label (or more than one label).</dd>
<dt>org <i>expression</i></dt>
<dd>Set origin. Sets the address where the next instructions will be assembled to, or bytes will be stored.

    org $100
</dd>
<dt>.phase <i>expression</i></dt>
<dd>Set phase. Sets the code address without changing the output address.</dd>
<dt>.endphase</dt>
<dt>.dephase</dt>
<dd>End phase – Ends phased compilation, and resets the code address to match the output address.</dd>
<dt>macro <i>macroname</i> <i>labels</i></dt>
<dd>Define a macro. The parameters can be treated the same as EQUates until the macro ends.

    macro add a,b
</dd>
<dt>endm</dt>
<dd>End a macro definition.</dd>
<dt><i>macroname</i> <i>arguments</i></dt>
<dd>Call a macro.</dd>
<dt>.block</dt>
<dd>Start a block. Any labels declared within the block are only visible within that block. Blocks can be nested, so labels are also visible to blocks within the block.</dd>
<dt>.endblock</dt>
<dd>End a block.</dd>
<dt>.align <i>expression</i></dt>
<dd>Align the next byte so that its address modulo <i>expression</i> is zero. (If we're in phased compilation, the phase address is aligned.)</dd>
<dt>.ìnclude <i>filename</i></dt>
<dd>Include a file and process it as if it were in the current file. The filename is relative to the current file. If you include a file from an included file, that filename will also be relative to the file the includ statement is in.

    .include "something/routines.z80"
</dd>
<dt>.if <i>expression</i></dt>
<dd>Assembles the code following the .if statement if the expression evaluates to true, up the next .endif or .else statement.

Note that the if expression must be evaluable on the first pass of assembly. Also, weird things might happen if an .if-.else-.endif block crosses a macro boundary.
</dd>
<dt>.else</dt>
<dd>If an .if statement's expression evaluted to false, the code following the .else statement is assembled isntead, up to the next .endif statement.</dd>
<dt>.endif</dt>
<dd>Marks the end of a conditiona assembly block.</dd>
</dl>

Expressions
-----------

Maz supports expressions with proper precedence, and various different syntaxes for operators. The operators are, in order of precedence (highest first):

| Operators | Description |
|-----------|-------------|
| ( ) function() | ( ) → brackets<br>function() → various functions (see below) |
| ! ~ + -   | *Unary operators*<br>! → logical not<br>~ → bitwise not <br>+ → unary plus<br>- → unary minus
| * / % mod | * → multiply<br>/ → divide<br>% or mod → modulus |
| + - | + → add<br>- → subtract |
| << shl >> shr | << or shl → shift left<br>>> or shr → shift right |
| < lt > gt <= le >= ge | < or lt → less than<br>> or gt → greater than<br><= or le → less than or equal<br>>= or ge → greater than or equal |
| & and | & or and → bitwise and |
| ^ xor | ^ or xor → bitwise xor |
| \| or | \| or or → bitwise or |
| && | && → logical and |
| \|\| | \|\| → logical or |
| ?: | ?: → ternary operator |

Textual operators must be followed by either some whitespace or an open bracket.

Functions
---------

There are some functions which you can use in expressions:

| Function | Description |
|----------|-------------|
| min(x, y) | Returns the smallest of x and y |
| max(x, y) | Returns the largest of x and y |

Instructions
------------

Maz supports all undocumented Z80 instructions. See this website for a list of undocumented instructions: http://clrhome.org/table/

The Z80 instruction syntax is a little inconsitent around some 8-bit instructions, for example ADD A,B includes the accumulator, but SUB B doesn't. When using Maz the "A," is optional for all of the following instructions: ADD, ADC, SUB, SBC, AND, XOR, OR, CP.
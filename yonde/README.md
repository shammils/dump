sugi:
	mustContain and complex. keep it simple

how do we determine:
	hey partner what time is it

	what time is it

	hey partner

what does the first line do, retort or tell the time?

how about we do something like ES with scores? lets consider the following:

[what, time, is, it]

with that defined, asking 'what time is it' would be a score of 100%(or whatever). Considering the order also, 'what is the time' would hit on 3/4 words and hit 1/4 words considering order.

we could weight commands, for instance:
	what time is it
	hey partner

giving the first command more weight means that if we say
	hey partner what time is it

would hit the time command instead of the retort path

we can take order into account. we can give the last hit command more weight
	hey partner what time is it
vs
	what time is it hey partner

the second doesnt make much sense, at least in the english language.

	oi aibo ima nan jikan
vs
	ima nan jikan oi aibo

same shit in nihongo

	neeee neee hayaku shite nee nee

makes more sense spoken. the middle words would carry much more weight that the outside 4

data types:
	command: direct inquiry, something we want.
		EX: show cpu usage, how hot is it outside
	response: not a direct inquiry
		EX: this sucks, you are speaking too fast

we are going to have to support context in the first version. consider the following:
	what do you think?

if the previous discussion was about dinner, then the answer to that inquiry would be dinner related, but without context, the only valid response is 'about what?'. yonde needs to manage context properly.

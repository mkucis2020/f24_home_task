<?php

function writeLine($string) 
{
    echo $string . PHP_EOL;
}

function writeStatus($argument)
{
    if(!empty($argument))
    {
        writeLine("✔️ Succeeded");
        
    }
    else
    {
        writeLine("❌ Failed");
    }
    writeLine("");
}

// Used from https://gist.github.com/xhit/83f22ef5e7ab3971f7a35017cc5d31f9
function uuidv7() 
{
	$timestamp = intval(microtime(true) * 1000);

	return sprintf(
		'%02x%02x%02x%02x-%02x%02x-%04x-%04x-%012x',
		($timestamp >> 40) & 0xFF,
		($timestamp >> 32) & 0xFF,
		($timestamp >> 24) & 0xFF,
		($timestamp >> 16) & 0xFF,
		($timestamp >> 8) & 0xFF,
		$timestamp & 0xFF,
		random_int(0, 0x0FFF) | 0x7000,
		random_int(0, 0x3FFF) | 0x8000,
		random_int(0, 0xFFFFFFFFFFFF),
	);
}
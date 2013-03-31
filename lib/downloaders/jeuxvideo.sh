if echo "$uri" | grep -qE '\.jeuxvideo\.|0L0Sjeuxvideo0N0C'
then

data=$(wget -q -O- "$uri" | perl -ne 'if(m{value="config=(.*?)"}){print $1; exit}' | wget -q -O- -i-)
: ${data:?}

title=$(echo "$data" | perl -ne 'if(m{<sharing.twitter.text>(.*?)<}){print decode_entities($1)}')
: ${title:?}

echo "$data" | perl -ne 'if(m{"taille":"720p","file":"(.*?)"}){print "http://video720.jeuxvideo.com/$1"}' | wget -O "$XDG_VIDEOS_DIR/$title.mp4" -i- -c

fi

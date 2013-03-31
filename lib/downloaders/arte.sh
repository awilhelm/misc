if echo "$uri" | grep -q '\.arte\.'
then

data=$(wget -q -O- "$uri")
: ${data:?}

title=$(echo "$data" | perl -ne 'y{/}{:}; if(m{<h1>(.*)<:h1>}){print decode_entities($1)}')
: ${title:=$(basename "$uri" .html)}

date=$(echo "$data" | perl -ne 'if(m{\W(\d\d)-(\d\d)-(\d\d)\W}){print "20$3-$2-$1"; exit}')
: ${date:?}

video=$(echo "$data" | perl -ne 'if(m{vars_player.videorefFileUrl\s*=\s*"(.*?)"}){print $1}' | wget -q -i- -O- | perl -ne 'if(m{lang="fr".*?ref="(.*?)"}){print $1}' | wget -q -i- -O- | perl -ne 'if(m{quality="hd".*?>(.*?)<}){print $1}')
: ${video:?}

player=$(echo "$data" | perl -ne 'if(m{var url_player\s*=\s*"(.*?)"}){print $1}')
: ${player:?}

rtmpdump -r "$video" -W "$player" -o "$XDG_VIDEOS_DIR/$title $date.mp4" -e

fi

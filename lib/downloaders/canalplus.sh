if echo "$uri" | grep -q '\.canalplus\.'
then

video=$(wget -q -O- "$uri" | perl -ne 'if(m{\svideoId="(\w*)"}){print $1}')
: ${video:?}

cd "$XDG_VIDEOS_DIR"
wget -q -O- "http://service.canal-plus.com/video/rest/getVideosLiees/cplus/$video" | perl -e 'undef $/; $_ = <>; m{<ID>'"$video"'</ID>.*?<HD>(.*?)</HD>}; print $1' | wget -i- -c

fi

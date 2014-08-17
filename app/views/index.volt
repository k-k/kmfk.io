<!DOCTYPE html>
<html>
    <head>
        {{ get_title() }}
        {{ assets.outputCss() }}

        {{ assets.outputJs() }}
    </head>
    <body>
        {{ get_content() }}
    </body>
</html>

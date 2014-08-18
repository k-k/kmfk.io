<!DOCTYPE html>
<html>
    <head>
        {{ get_title() }}
        <link rel="shortcut icon" href="img/favicon-blue.ico" type="image/x-icon">
        <link rel="icon" href="img/favicon-blue.ico" type="image/x-icon">
        {{ assets.outputCss() }}

        {{ assets.outputJs() }}
    </head>
    <body>
        {{ get_content() }}
    </body>
</html>

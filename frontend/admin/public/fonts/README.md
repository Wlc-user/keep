# 字体文件

此目录应包含以下字体文件：

- roboto-v20-latin-regular.woff2
- roboto-v20-latin-500.woff2
- roboto-v20-latin-700.woff2

请从Google Fonts或其他来源下载这些字体文件并放置在此目录中。

## 使用CDN替代方案

如果不想本地托管字体文件，可以在index.html中添加以下链接：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
``` 
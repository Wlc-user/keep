-- 创建全文搜索目录（如果不存在）
IF NOT EXISTS (SELECT 1 FROM sys.fulltext_catalogs WHERE name = 'MaterialsCatalog')
BEGIN
    CREATE FULLTEXT CATALOG MaterialsCatalog AS DEFAULT;
END

-- 检查Materials表是否存在全文索引
IF NOT EXISTS (
    SELECT 1 
    FROM sys.fulltext_indexes i
    JOIN sys.tables t ON i.object_id = t.object_id
    WHERE t.name = 'Materials'
)
BEGIN
    -- 在Materials表上创建全文索引
    CREATE FULLTEXT INDEX ON dbo.Materials
    (
        Title LANGUAGE 2052, -- 简体中文
        Description LANGUAGE 2052,
        Category LANGUAGE 2052
    )
    KEY INDEX PK_Materials -- 主键索引名称
    ON MaterialsCatalog
    WITH CHANGE_TRACKING AUTO;
END
GO

-- 创建全文搜索存储过程
IF OBJECT_ID('dbo.SearchMaterials', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SearchMaterials
GO

CREATE PROCEDURE dbo.SearchMaterials
    @SearchTerm NVARCHAR(255),
    @Status NVARCHAR(50) = NULL,
    @Category NVARCHAR(100) = NULL,
    @AccessLevel NVARCHAR(50) = NULL,
    @PageSize INT = 10,
    @PageNumber INT = 1
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 构建基础查询
    DECLARE @SQL NVARCHAR(MAX)
    SET @SQL = N'
        SELECT m.*, u.UserName AS CreatorName,
               RANK() OVER (ORDER BY KEY_TBL.RANK DESC) AS SearchRank,
               COUNT(*) OVER () AS TotalCount
        FROM Materials m
        INNER JOIN CONTAINSTABLE(Materials, (Title, Description, Category), @SearchTerm) AS KEY_TBL
            ON m.Id = KEY_TBL.[KEY]
        LEFT JOIN AspNetUsers u ON m.CreatedBy = u.Id
        WHERE 1=1'
    
    -- 添加过滤条件
    IF @Status IS NOT NULL
        SET @SQL = @SQL + N' AND m.Status = @Status'
    
    IF @Category IS NOT NULL
        SET @SQL = @SQL + N' AND m.Category = @Category'
    
    IF @AccessLevel IS NOT NULL
        SET @SQL = @SQL + N' AND m.AccessLevel = @AccessLevel'
    
    -- 添加分页
    SET @SQL = @SQL + N'
        ORDER BY SearchRank
        OFFSET (@PageNumber - 1) * @PageSize ROWS
        FETCH NEXT @PageSize ROWS ONLY'
    
    -- 执行动态SQL
    EXEC sp_executesql @SQL,
        N'@SearchTerm NVARCHAR(255), @Status NVARCHAR(50), @Category NVARCHAR(100), @AccessLevel NVARCHAR(50), @PageSize INT, @PageNumber INT',
        @SearchTerm, @Status, @Category, @AccessLevel, @PageSize, @PageNumber
END
GO 


// 计数器
/*
关键词：当存在关键词的时候回复预先制定好的信息
翻译：任何语言先拿去做翻译，在翻译之后再进行关键词判定
标签记录：记录需要的信息
闲聊，暂时不需要
    1. 获取聊天内容，我们需要什么就问什么
    2. 对方的消息，先做一个初步的解析，比如表情，视频之类的，先排除掉
    3. 进行翻译，翻译完成之后再进行关键词判定，翻译时直接拿所有的新聊天记录去翻译
    4. 关键字，使用关键字来进行打标签
        4.1. 每一个标签中存在多个关键字，每一个关键字对应一个可能性
        4.2. 当多次触发关键字时将其放到二级标签中（几乎不使用）（冗余字段）
        4.3. 每一个标签还将保存原文，原文放到附加内容中，（冗余字段）


关于计数器：
    获取最新的时间，上传当前用户名+最早时间，时间在昨天之前则不进行上传
    每次新加载都会从服务器上拿到今天与昨天的列表
    1. 打开网页登录，从服务器拉取昨天最后上传的时间，
    2. 判断当前所选择的用户，如果已经被保存则不进行其他操作（最好是拿到账号）
    3. 判断时间是否在昨天最后上传的时间之前，如果在昨天最后上传的时间之前则不进行记录（以后可以更改，暂时就先这样）
    4. 留一句eval，从服务器获取

    难点： 
        1. 拿到自己的唯一id，确保不同设备登陆同一账号也是相同的
        解决方式：（last-wid	"447723504627@c.us"）
        2. 拿到客户的唯一id，确保修改备注不会影响
        解决方式：（var msgArr = document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children）
                （msgArr[msgArr.length-1]）
        （data-id="true_447596401851@c.us_3EB02D013D7AFF6B7594"）
        3. 拿到最久时间
        解决方式（document.querySelector('[aria-label="消息列表。在消息中点击向右箭头即可打开消息上下文菜单。"]').children[0].children[0].children[0].innerText）

        数据库字段结构：
            create table "user"(
                "user_id"            varchar(50) not null                                comment '用户id，用户手机号码（447723504627@c.us）',
                "create_time"       datetime                default current_timestamp   comment "创建时间",
                "update_time"       datetime                default current_timestamp on update current_timestamp   comment "修改时间，每次上传新用户时都会进行修改",
                "customer_number"   int         not null    default 0                   comment "累计接待客户量",
                primary key ("user_id")
            )engine=innodb default charset=utf8mb4 comment="用户表";

            create table "customer"(
                "id"            varchar(100)    not null    comment "客户id（true_447596401851@c.us_3EB02D013D7AFF6B7594）",
                "user_id"       varchar(50)                 comment "用户id，与用户产生联系"
                "create_time"   datetime    default current_timestamp   comment "创建时间"
                // primary key ("id")
            )engine=innodb default charset=utf8mb4 comment="客户表"

    服务器方面： 核心：提供增加接口，查询接口
                1. 进行时间校验
                2. 进行md5/sha-1校验（切割字符串校验）
                3. 进行客户校验（客户与用户的校验，某一个重复都不进行计算）
                4. 进行添加
                5. 进行用户数据更新，优先更新，没有用户数据再进行添加
            其他功能：统计：统计今天与昨天共增加的数量，设置按照时间查询即可
                // 分布式，直接使用ip进行通信
    脚本方面：
        1. 启动后从服务器拿到最后的更新时间
        2. 当每点击进入一个新的窗口时进行数据提交，包括自己的id，客户id，最久时间

*/


<dependency>
<groupId>tk.mybatis</groupId>
<artifactId>mapper-spring-boot-starter</artifactId>
<version>2.1.5</version>
</dependency>


添加： 添加到粉丝列表，账号一样则不进行添加，账号用户名链接
事务
获取：获取粉丝列表中的第一条没有被置为失效的数据并将其

在脚本方面处理完成之后从临时表中将数据置为失效状态


FansLabel


    /**
     * 粉丝标签
     */
    @GetMapping("/getlabel/{username}")
    @ResponseBody
    public TiktokFansLabelVO edit(@PathVariable("username") String username)
    {
        return tiktokFansLabelService.selectTiktokFansLabelByUsername(username);
    }

    </select>
        <select id="selectTiktokFansLabelByUsername" parameterType="String" resultMap="TiktokFansLabelResult">
        SELECT label_name,GROUP_CONCAT( label_body SEPARATOR ',') AS label_body
        FROM `tiktok_fans_label`
        WHERE username = #{username}
        GROUP BY label_name
    </select>


LabelInfo

@GetMapping("/labellist")
@ResponseBody
public TableDataInfo labelListJson(TiktokLabelInfo tiktokLabelInfo) {
    List<TiktokLabelList> list = tiktokLabelInfoService.selectTiktokLabelListList(tiktokLabelInfo);
    return getDataTable(list);
}

<select id="selectTiktokLabelListList" resultMap="TiktokLabelInfoResult">
SELECT `label_name`,`type`, GROUP_CONCAT( `body` SEPARATOR ',') AS `body`
FROM `tiktok_label_info`
GROUP BY `label_name`,`type`
</select>


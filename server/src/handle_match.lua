local nk = require("nakama")

local function get_match(context, payload)
    nk.logger_info(("called get_match by %q"):format(context.UserId))
    local records = nk.storage_list("", "kotiki.io", "rooms", 20, nil)

    for _, v in ipairs(records) do
        print(("match id: %q:%q:%q:%q"):format(v.Value.matchId, v.PermissionRead, v.PermissionWrite, v.UserId))
    end

    return nk.json_encode(records)
end

local function create_match(context, payload)
    nk.logger_info(("called create_match by %q"):format(context.UserId))

    local new_match = {{
        Bucket = "kotiki.io",
        Collection = "rooms",
        Record = os.date("%H:%M:%S_%d/%m/%Y"),
        Value = { matchId = string.gsub(payload, '"', '') },
        UserId = nil,
        PermissionRead = 2,
        PermissionWrite = 1
    }}
    nk.storage_write(new_match)

    return nk.json_encode({result = "OK"})
end

local function invalidate_matches(context, payload)
    local matches = nk.json_decode(payload)
    local record_keys = {}
    for k, v in ipairs(matches) do
        table.insert(record_keys, {
            Bucket = v.Bucket,
            Collection = v.Collection,
            Record = v.Record,
            UserId = v.UserId
        })
    end
    nk.storage_remove(record_keys)

    return nk.json_encode({result = "OK"})
end

nk.register_rpc(get_match, "get_match")
nk.register_rpc(create_match, "create_match")
nk.register_rpc(invalidate_matches, "invalidate_matches")
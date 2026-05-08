export default function VerifyPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center space-y-4">
      <div className="text-4xl">📬</div>
      <h1 className="text-xl font-bold text-gray-900">查看你的邮箱</h1>
      <p className="text-sm text-gray-500">
        我们发送了一个登录链接到你的邮箱。点击链接即可登录，无需密码。
      </p>
      <p className="text-xs text-gray-400">链接将在 24 小时后失效</p>
    </div>
  );
}

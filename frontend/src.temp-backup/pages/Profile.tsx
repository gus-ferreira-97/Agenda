import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Save,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Crown,
    Shield,
    Sparkles,
    AlertTriangle,
    Trash2,
    X,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useMe } from '../hooks/useMe';
import { usePlan } from '../hooks/usePlan';
import { useTrial } from '../hooks/useTrial';
import PasswordChecklist, { isPasswordStrong } from '../components/PasswordChecklist';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { me, loading: loadingMe, reload: reloadMe } = useMe();

    const isTenantAdmin = user?.role === 'tenant_admin';
    const { plan } = usePlan(isTenantAdmin);
    const { trial } = useTrial(isTenantAdmin);


    // Dados da conta
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [savingAccount, setSavingAccount] = useState(false);
    const [accountSuccess, setAccountSuccess] = useState('');
    const [accountError, setAccountError] = useState('');

    // Troca de senha
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Zona de Perigo — exclusão de conta
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    // Carrega os dados do usuário quando o hook termina
    useEffect(() => {
        if (me) {
            setName(me.name);
            setEmail(me.email);
        }
    }, [me]);

    // ============ HANDLERS ============

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccountError('');
        setAccountSuccess('');

        if (!name.trim()) {
            setAccountError('O nome não pode ficar em branco.');
            return;
        }

        if (!email.trim()) {
            setAccountError('O e-mail não pode ficar em branco.');
            return;
        }

        setSavingAccount(true);
        try {
            await api.patch('/users/me', { name, email });
            setAccountSuccess('Dados atualizados com sucesso!');
            await reloadMe();
            setTimeout(() => setAccountSuccess(''), 3000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setAccountError(Array.isArray(msg) ? msg.join(' • ') : msg || 'Erro ao salvar.');
        } finally {
            setSavingAccount(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword) {
            setPasswordError('Informe a senha atual.');
            return;
        }
        if (!isPasswordStrong(newPassword)) {
            setPasswordError('A nova senha não atende todos os requisitos de segurança.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('As senhas não coincidem.');
            return;
        }

        setSavingPassword(true);
        try {
            await api.patch('/users/me/password', { currentPassword, newPassword });
            setPasswordSuccess('Senha alterada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                setPasswordSuccess('');
                setShowPasswordForm(false);
            }, 3000);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setPasswordError(Array.isArray(msg) ? msg.join(' • ') : msg || 'Erro ao trocar a senha.');
        } finally {
            setSavingPassword(false);
        }
    };

    const formatDate = (iso?: string) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const planLabel = (p?: string) => {
        switch (p) {
            case 'basico': return 'Básico';
            case 'profissional': return 'Profissional';
            case 'premium': return 'Premium';
            default: return p || '—';
        }
    };

    const planColor = (p?: string) => {
        switch (p) {
            case 'basico': return 'bg-gray-100 text-gray-800';
            case 'profissional': return 'bg-violet-100 text-violet-300';
            case 'premium': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const roleLabel = (r?: string) => {
        if (r === 'super_admin') return 'Super Admin';
        if (r === 'tenant_admin') return 'Admin Tenant';
        return r || '—';
    };

    if (loadingMe) {
        return (
            <div className="p-4 md:p-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    <svg className="animate-spin w-6 h-6 mx-auto mb-3 text-violet-300" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Carregando...
                </div>
            </div>
        );
    }

    const handleDeleteAccount = async () => {
        setDeleteError('');

        if (deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR') {
            setDeleteError('Digite EXCLUIR para confirmar.');
            return;
        }

        setDeletingAccount(true);
        try {
            await api.delete('/users/me');
            // Logout local + redirect para home
            logout();
            navigate('/');
        } catch (err: any) {
            const message = err.response?.data?.message;
            setDeleteError(
                Array.isArray(message)
                    ? message.join(' • ')
                    : message || 'Erro ao excluir a conta. Tente novamente.',
            );
            setDeletingAccount(false);
        }
    };

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 animate-fade-in-up">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">Meu Perfil</h1>
                <p className="text-sm md:text-base text-gray-600">
                    Gerencie seus dados de acesso e segurança.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Coluna principal (2/3) */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    {/* Card: Dados da conta */}
                    <form
                        onSubmit={handleAccountSubmit}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-100"
                    >
                        <div className="flex items-center gap-2 mb-5">
                            <User className="w-5 h-5 text-violet-300" />
                            <h2 className="text-base font-semibold text-gray-900">Dados da conta</h2>
                        </div>

                        {accountError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{accountError}</span>
                            </div>
                        )}
                        {accountSuccess && (
                            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>{accountSuccess}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nome completo
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id="name"
                                        type="text"
                                        maxLength={255}
                                        value={name}
                                        autoComplete="name"
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    E-mail
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    <input
                                        id="email"
                                        type="email"
                                        maxLength={255}
                                        value={email}
                                        autoComplete="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                                        placeholder="voce@email.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={savingAccount}
                                className="inline-flex items-center gap-2 bg-violet-300 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-violet-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                            >
                                {savingAccount ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Salvar alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Card: Segurança */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-200">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-violet-300" />
                                <h2 className="text-base font-semibold text-gray-900">Segurança</h2>
                            </div>
                            {!showPasswordForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordForm(true)}
                                    className="text-sm font-medium text-violet-300 hover:underline"
                                >
                                    Trocar senha
                                </button>
                            )}
                        </div>

                        {!showPasswordForm ? (
                            <p className="text-sm text-gray-600">
                                Use uma senha forte para manter sua conta protegida. Recomendamos trocar
                                periodicamente.
                            </p>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                                {passwordError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{passwordError}</span>
                                    </div>
                                )}
                                {passwordSuccess && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                        <span>{passwordSuccess}</span>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Senha atual
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            id="currentPassword"
                                            type={showCurrent ? 'text' : 'password'}
                                            maxLength={128}
                                            value={currentPassword}
                                            autoComplete="current-password"
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full pl-9 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                                            placeholder="Digite sua senha atual"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrent(!showCurrent)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nova senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            id="newPassword"
                                            type={showNew ? 'text' : 'password'}
                                            maxLength={128}
                                            value={newPassword}
                                            autoComplete="new-password"
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-9 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition"
                                            placeholder="Crie uma senha forte"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <PasswordChecklist password={newPassword} show={newPassword.length > 0} />
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Repita a nova senha
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                        <input
                                            id="confirmPassword"
                                            type={showConfirm ? 'text' : 'password'}
                                            maxLength={128}
                                            value={confirmPassword}
                                            autoComplete="new-password"
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full pl-9 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition ${confirmPassword.length > 0 && confirmPassword !== newPassword
                                                ? 'border-red-300'
                                                : 'border-gray-300'
                                                }`}
                                            placeholder="Digite a senha novamente"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                                        <p className="text-xs text-red-600 mt-1">As senhas não coincidem</p>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setPasswordError('');
                                            setPasswordSuccess('');
                                        }}
                                        className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingPassword}
                                        className="flex-1 bg-violet-300 text-white py-2.5 rounded-lg font-medium hover:bg-violet-300 disabled:opacity-60 disabled:cursor-not-allowed transition inline-flex items-center justify-center gap-2"
                                    >
                                        {savingPassword ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                                </svg>
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Trocar senha
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Coluna lateral (1/3) */}
                <div className="lg:col-span-1 space-y-4 md:space-y-6">
                    {/* Card: Informações da conta */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-300">
                        <div className="flex items-center gap-2 mb-5">
                            <User className="w-5 h-5 text-violet-300" />
                            <h2 className="text-base font-semibold text-gray-900">Informações</h2>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Papel</p>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    <Shield className="w-3 h-3" />
                                    {roleLabel(me?.role)}
                                </span>
                            </div>

                            <div>
                                <p className="text-gray-500 mb-1">Conta criada em</p>
                                <p className="text-gray-900 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {formatDate(me?.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card: Plano e status (só tenant admin) */}
                    {isTenantAdmin && plan && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 animate-fade-in-up delay-400">
                            <div className="flex items-center gap-2 mb-5">
                                <Crown className="w-5 h-5 text-violet-300" />
                                <h2 className="text-base font-semibold text-gray-900">Seu plano</h2>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Plano atual</p>
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${planColor(plan.plan)}`}>
                                        {planLabel(plan.plan)}
                                    </span>
                                </div>

                                {plan.maxProfessionals !== null && (
                                    <div>
                                        <p className="text-gray-500 mb-1">Profissionais</p>
                                        <p className="text-gray-900">
                                            {plan.currentProfessionals} de {plan.maxProfessionals}
                                        </p>
                                    </div>
                                )}
                                {plan.maxProfessionals === null && (
                                    <div>
                                        <p className="text-gray-500 mb-1">Profissionais</p>
                                        <p className="text-gray-900">{plan.currentProfessionals} (ilimitado)</p>
                                    </div>
                                )}

                                {trial?.isTrial && !trial.isExpired && (
                                    <div className={`p-3 rounded-lg border ${trial.daysLeft <= 1
                                        ? 'bg-red-50 border-red-200'
                                        : trial.daysLeft <= 3
                                            ? 'bg-yellow-50 border-yellow-200'
                                            : 'bg-violet-50 border-violet-100'
                                        }`}>
                                        <p className={`text-xs font-semibold mb-1 ${trial.daysLeft <= 1
                                            ? 'text-red-900'
                                            : trial.daysLeft <= 3
                                                ? 'text-yellow-900'
                                                : 'text-violet-300'
                                            }`}>
                                            Período de teste
                                        </p>
                                        <p className={`text-xs ${trial.daysLeft <= 1
                                            ? 'text-red-800'
                                            : trial.daysLeft <= 3
                                                ? 'text-yellow-800'
                                                : 'text-violet-300'
                                            }`}>
                                            {trial.daysLeft === 0
                                                ? 'Termina hoje'
                                                : trial.daysLeft === 1
                                                    ? 'Termina amanhã'
                                                    : `Restam ${trial.daysLeft} dias`}
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={(e) => e.preventDefault()}
                                    className="w-full inline-flex items-center justify-center gap-2 border border-violet-300 text-violet-300 py-2.5 rounded-lg font-medium hover:bg-violet-50 transition"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Fazer upgrade
                                </button>
                                <p className="text-xs text-gray-400 text-center">
                                    Em breve disponível.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Card: Zona de Perigo — exclusão de conta (LGPD) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-4 md:p-6 animate-fade-in-up delay-500">
                        <div className="flex items-center gap-2 mb-5">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <h2 className="text-base font-semibold text-red-900">Zona de perigo</h2>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    Excluir minha conta
                                </p>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Ao excluir sua conta, todos os seus dados pessoais serão
                                    permanentemente anonimizados conforme a LGPD (Lei 13.709/2018).
                                    Esta ação <strong>não pode ser desfeita</strong>.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteConfirmText('');
                                    setDeleteError('');
                                    setShowDeleteModal(true);
                                }}
                                className="inline-flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir minha conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmação de exclusão */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
                    onClick={() => !deletingAccount && setShowDeleteModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => !deletingAccount && setShowDeleteModal(false)}
                            disabled={deletingAccount}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Excluir sua conta?
                            </h3>
                        </div>

                        <div className="space-y-3 text-sm text-gray-700 mb-5">
                            <p>Esta ação irá:</p>
                            <ul className="space-y-1.5 pl-5 list-disc text-xs">
                                <li>Anonimizar permanentemente seus dados pessoais (nome, e-mail)</li>
                                <li>Invalidar seu acesso (você não poderá mais fazer login)</li>
                                <li>Manter registros de auditoria por 365 dias (obrigação legal)</li>
                            </ul>
                            <p className="font-medium text-red-700 text-xs">
                                Não é possível reverter esta ação.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                                Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                disabled={deletingAccount}
                                autoComplete="off"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm disabled:bg-gray-100"
                                placeholder="EXCLUIR"
                            />
                        </div>

                        {deleteError && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{deleteError}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deletingAccount}
                                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                disabled={
                                    deletingAccount ||
                                    deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'
                                }
                                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deletingAccount ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                        Excluindo...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Excluir definitivamente
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}